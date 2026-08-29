import type { AttendanceRecord, SpecialDate } from "../store/useOjtStore";
import { dateKey } from "./date";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const dayStart = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());
const parseDate = (value: string) => {
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
export const isWorkingDay = (date: Date, workingDays: string[]) =>
  workingDays.includes(dayNames[date.getDay()]);
const hasAttendance = (records: AttendanceRecord[], date: Date) =>
  records.some(
    (record) => record.status === "present" && record.date === dateKey(date),
  );
export const isExcusedDate = (date: Date, specialDates: SpecialDate[] = []) =>
  specialDates.some((item) => item.date === dateKey(date));

export function isValidAttendanceDate(
  value: string,
  startDate: string,
  workingDays: string[],
  today = new Date(),
) {
  const date = parseDate(value);
  const start = parseDate(startDate);
  if (!date || !start || date < dayStart(start) || date > dayStart(today))
    return false;
  return isWorkingDay(date, workingDays);
}

export function validAttendanceRecords(
  records: AttendanceRecord[],
  startDate?: string,
  workingDays?: string[],
  today = new Date(),
) {
  const seen = new Set<string>();
  return records.filter((record) => {
    const parsed = parseDate(record.date);
    if (!parsed || record.status !== "present" || seen.has(record.date))
      return false;
    if (
      startDate &&
      workingDays &&
      !isValidAttendanceDate(record.date, startDate, workingDays, today)
    )
      return false;
    seen.add(record.date);
    return true;
  });
}

export function calculateTotalHoursLogged(
  records: AttendanceRecord[],
  startDate?: string,
  workingDays?: string[],
  today = new Date(),
) {
  return validAttendanceRecords(records, startDate, workingDays, today).reduce(
    (sum, record) => sum + (record.hoursLogged ?? 0),
    0,
  );
}

export function calculateCompletedDays(
  records: AttendanceRecord[],
  totalRequiredDays = Number.MAX_SAFE_INTEGER,
  startDate?: string,
  workingDays?: string[],
  today = new Date(),
) {
  return Math.min(
    validAttendanceRecords(records, startDate, workingDays, today).length,
    Math.max(totalRequiredDays, 0),
  );
}
export function calculateRemainingDays(
  totalRequiredDays: number,
  records: AttendanceRecord[],
  startDate?: string,
  workingDays?: string[],
  today = new Date(),
) {
  return Math.max(
    totalRequiredDays -
      calculateCompletedDays(
        records,
        totalRequiredDays,
        startDate,
        workingDays,
        today,
      ),
    0,
  );
}
export function calculateProgress(
  totalRequiredDays: number,
  records: AttendanceRecord[],
  startDate?: string,
  workingDays?: string[],
  today = new Date(),
) {
  const completed = calculateCompletedDays(
    records,
    totalRequiredDays,
    startDate,
    workingDays,
    today,
  );
  return totalRequiredDays > 0
    ? Math.min(Math.max((completed / totalRequiredDays) * 100, 0), 100)
    : 0;
}

export function calculateAbsentDays(
  records: AttendanceRecord[],
  startDate: string,
  workingDays: string[],
  today = new Date(),
  specialDates: SpecialDate[] = [],
) {
  const start = parseDate(startDate);
  if (!start || !workingDays.length) return 0;
  const validRecords = validAttendanceRecords(
    records,
    startDate,
    workingDays,
    today,
  );
  const cursor = dayStart(start);
  const end = dayStart(today);
  let absent = 0;
  // Exclusive of today: a working day that hasn't finished yet
  // shouldn't be counted as a missed/absent day.
  while (cursor < end) {
    if (
      isWorkingDay(cursor, workingDays) &&
      !isExcusedDate(cursor, specialDates) &&
      !hasAttendance(validRecords, cursor)
    ) {
      absent += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return absent;
}

export function calculateCurrentStreak(
  records: AttendanceRecord[],
  workingDays: string[],
  startDate?: string,
  today = new Date(),
  specialDates: SpecialDate[] = [],
) {
  if (!workingDays.length) return 0;
  const validRecords = validAttendanceRecords(
    records,
    startDate,
    workingDays,
    today,
  );
  const cursor = dayStart(today);
  let streak = 0;
  for (let guard = 0; guard < 370; guard += 1) {
    if (isWorkingDay(cursor, workingDays) && !isExcusedDate(cursor, specialDates)) {
      if (!hasAttendance(validRecords, cursor)) break;
      streak += 1;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function calculateWeeklyConsistency(
  records: AttendanceRecord[],
  workingDays: string[],
  startDate?: string,
  today = new Date(),
  specialDates: SpecialDate[] = [],
) {
  if (!workingDays.length) return 0;
  const cursor = dayStart(today);
  const mondayOffset = (cursor.getDay() + 6) % 7;
  const weekStart = new Date(cursor);
  weekStart.setDate(cursor.getDate() - mondayOffset);
  let expected = 0;
  let present = 0;
  const validRecords = validAttendanceRecords(
    records,
    startDate,
    workingDays,
    today,
  );
  for (let index = 0; index <= mondayOffset; index += 1) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    if (
      isValidAttendanceDate(
        dateKey(date),
        startDate ?? "0000-01-01",
        workingDays,
        today,
      ) &&
      !isExcusedDate(date, specialDates)
    ) {
      expected += 1;
      if (hasAttendance(validRecords, date)) present += 1;
    }
  }
  return expected ? Math.round((present / expected) * 100) : 0;
}
