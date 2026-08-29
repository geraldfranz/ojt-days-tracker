import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  dateKey,
  DEFAULT_START_DATE,
  isValidDateKey,
  getToday,
} from "../lib/date";
import { getPhRegularHolidays } from "../lib/phHolidays";

export interface AttendanceRecord {
  id: string;
  date: string;
  status: "present";
  hoursLogged: number;
  notes?: string;
}

export type SpecialDateType = "holiday" | "suspended";

export interface SpecialDate {
  id: string;
  date: string;
  type: SpecialDateType;
  label?: string;
  auto?: boolean; // true = auto-seeded from the PH regular holiday list
}

interface OjtState {
  userName: string;
  totalRequiredDays: number;
  hoursPerDay: number;
  startDate: string;
  workingDays: string[];
  attendanceRecords: AttendanceRecord[];
  specialDates: SpecialDate[];
  seededHolidayYears: number[];
  addAttendance: (record: Omit<AttendanceRecord, "id">) => void;
  updateAttendance: (id: string, data: Partial<AttendanceRecord>) => void;
  removeAttendance: (id: string) => void;
  setSpecialDate: (
    date: string,
    type: SpecialDateType,
    label?: string,
  ) => void;
  removeSpecialDate: (id: string) => void;
  ensureHolidaysSeeded: (year: number) => void;
  updateSettings: (
    settings: Pick<
      OjtState,
      "userName" | "totalRequiredDays" | "hoursPerDay" | "startDate" | "workingDays"
    >,
  ) => void;
  resetData: () => void;
}

const mockDate = (daysAgo: number) => {
  const date = new Date(getToday());
  date.setDate(date.getDate() - daysAgo);
  return dateKey(date);
};
const initialState = {
  userName: "",
  totalRequiredDays: 480,
  hoursPerDay: 8,
  startDate: DEFAULT_START_DATE,
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  attendanceRecords: [
    {
      id: "1",
      date: mockDate(4),
      status: "present" as const,
      hoursLogged: 8,
      notes: "Worked on the dashboard.",
    },
    { id: "2", date: mockDate(3), status: "present" as const, hoursLogged: 8 },
    {
      id: "3",
      date: mockDate(2),
      status: "present" as const,
      hoursLogged: 8,
      notes: "Reviewed project requirements.",
    },
    { id: "4", date: mockDate(1), status: "present" as const, hoursLogged: 8 },
  ],
  specialDates: [] as SpecialDate[],
  seededHolidayYears: [] as number[],
};

export const useOjtStore = create<OjtState>()(
  persist(
    (set, get) => ({
      ...initialState,
      addAttendance: (record) =>
        set((state) =>
          !isValidDateKey(record.date) ||
          state.attendanceRecords.some((item) => item.date === record.date)
            ? state
            : {
                attendanceRecords: [
                  ...state.attendanceRecords,
                  {
                    ...record,
                    id: crypto.randomUUID(),
                    hoursLogged:
                      record.hoursLogged && record.hoursLogged > 0
                        ? record.hoursLogged
                        : state.hoursPerDay,
                    notes: record.notes?.slice(0, 500),
                  },
                ],
                // A day can't be both "present" and a holiday/suspension.
                specialDates: state.specialDates.filter(
                  (item) => item.date !== record.date,
                ),
              },
        ),
      updateAttendance: (id, data) =>
        set((state) => {
          const current = state.attendanceRecords.find(
            (record) => record.id === id,
          );
          if (
            !current ||
            (data.date &&
              (!isValidDateKey(data.date) ||
                state.attendanceRecords.some(
                  (record) => record.id !== id && record.date === data.date,
                )))
          )
            return state;
          return {
            attendanceRecords: state.attendanceRecords.map((record) =>
              record.id === id
                ? {
                    ...record,
                    ...data,
                    hoursLogged:
                      data.hoursLogged !== undefined
                        ? Math.max(0.5, Math.min(24, data.hoursLogged))
                        : record.hoursLogged,
                    notes: data.notes?.slice(0, 500) ?? record.notes,
                  }
                : record,
            ),
          };
        }),
      removeAttendance: (id) =>
        set((state) => ({
          attendanceRecords: state.attendanceRecords.filter(
            (record) => record.id !== id,
          ),
        })),
      setSpecialDate: (date, type, label) =>
        set((state) => {
          if (!isValidDateKey(date)) return state;
          const others = state.specialDates.filter((item) => item.date !== date);
          const existing = state.specialDates.find((item) => item.date === date);
          return {
            specialDates: [
              ...others,
              {
                id: existing?.id ?? crypto.randomUUID(),
                date,
                type,
                label: label?.trim().slice(0, 80) || undefined,
                auto: existing?.auto && existing.type === type ? existing.auto : false,
              },
            ],
            // A holiday/suspension day can't also be a "present" record.
            attendanceRecords: state.attendanceRecords.filter(
              (record) => record.date !== date,
            ),
          };
        }),
      removeSpecialDate: (id) =>
        set((state) => ({
          specialDates: state.specialDates.filter((item) => item.id !== id),
        })),
      ensureHolidaysSeeded: (year) => {
        const state = get();
        if (state.seededHolidayYears.includes(year)) return;
        const seeds = getPhRegularHolidays(year);
        set((current) => {
          const existingDates = new Set(current.specialDates.map((d) => d.date));
          const additions: SpecialDate[] = seeds
            .filter((seed) => !existingDates.has(seed.date))
            .map((seed) => ({
              id: crypto.randomUUID(),
              date: seed.date,
              type: "holiday" as const,
              label: seed.label,
              auto: true,
            }));
          return {
            specialDates: [...current.specialDates, ...additions],
            seededHolidayYears: [...current.seededHolidayYears, year],
          };
        });
      },
      updateSettings: (settings) =>
        set({
          userName: settings.userName.trim().slice(0, 60),
          totalRequiredDays: Math.max(
            1,
            Math.floor(settings.totalRequiredDays) || 1,
          ),
          hoursPerDay: Math.max(1, Math.floor(settings.hoursPerDay) || 8),
          startDate: settings.startDate,
          workingDays: [...new Set(settings.workingDays)],
        }),
      resetData: () => set(initialState),
    }),
    {
      name: "ojt-days-tracker",
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as OjtState;
        if (version < 1 && state?.attendanceRecords) {
          state.attendanceRecords = state.attendanceRecords.map((record) => ({
            ...record,
            hoursLogged:
              // Old records didn't store hours per day; backfill using
              // the hoursPerDay setting that was in effect.
              (record as Partial<AttendanceRecord>).hoursLogged ??
              state.hoursPerDay ??
              8,
          }));
        }
        if (!state.specialDates) state.specialDates = [];
        if (!state.seededHolidayYears) state.seededHolidayYears = [];
        return state;
      },
      partialize: (state) => ({
        userName: state.userName,
        totalRequiredDays: state.totalRequiredDays,
        hoursPerDay: state.hoursPerDay,
        startDate: state.startDate,
        workingDays: state.workingDays,
        attendanceRecords: state.attendanceRecords,
        specialDates: state.specialDates,
        seededHolidayYears: state.seededHolidayYears,
      }),
    },
  ),
);
