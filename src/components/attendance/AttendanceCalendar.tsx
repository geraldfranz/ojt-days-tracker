import { Check, ChevronLeft, ChevronRight, CloudRain, Flag } from "lucide-react";
import { useMemo } from "react";
import { dateKey, getToday } from "../../lib/date";
import { isValidAttendanceDate } from "../../lib/ojtCalculations";
import type { SpecialDate } from "../../store/useOjtStore";

// Philippine calendars conventionally start the week on Sunday.
const week = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
interface CalendarProps {
  month: Date;
  setMonth: (month: Date) => void;
  presentDates: string[];
  specialDates: SpecialDate[];
  onSelect: (date: Date) => void;
  startDate: string;
  workingDays: string[];
  canAddAttendance: boolean;
}
export function AttendanceCalendar({
  month,
  setMonth,
  presentDates,
  specialDates,
  onSelect,
  startDate,
  workingDays,
  canAddAttendance,
}: CalendarProps) {
  const today = getToday();
  const specialByDate = useMemo(() => {
    const map = new Map<string, SpecialDate>();
    specialDates.forEach((item) => map.set(item.date, item));
    return map;
  }, [specialDates]);
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = first.getDay(); // Sunday-start: no shift needed
    const count = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    return [
      ...Array(offset).fill(null),
      ...Array.from(
        { length: count },
        (_, index) =>
          new Date(month.getFullYear(), month.getMonth(), index + 1),
      ),
    ];
  }, [month]);
  return (
    <section className="panel calendar-panel">
      <div className="calendar-top">
        <div>
          <p className="eyebrow">MONTHLY VIEW</p>
          <h2>
            {new Intl.DateTimeFormat("en-US", {
              month: "long",
              year: "numeric",
            }).format(month)}
          </h2>
        </div>
        <div className="month-controls">
          <button
            className="icon-button subtle"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="icon-button subtle"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {week.map((day) => (
          <span className="weekday" key={day}>
            {day.slice(0, 3)}
          </span>
        ))}
        {days.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} />;
          const key = dateKey(date);
          const isPresent = presentDates.includes(key);
          const special = specialByDate.get(key);
          const isHoliday = special?.type === "holiday";
          const isSuspended = special?.type === "suspended";
          const unavailable = !isValidAttendanceDate(
            key,
            startDate,
            workingDays,
            today,
          );
          // A required working day that's already passed, with no
          // attendance, holiday, or suspension recorded — a true absence.
          const isAbsent =
            !isPresent && !special && !unavailable && key !== dateKey(today);
          return (
            <button
              key={key}
              className={[
                "day",
                isPresent ? "present" : "",
                isHoliday ? "holiday" : "",
                isSuspended ? "suspended" : "",
                isAbsent ? "absent" : "",
                key === dateKey(today) ? "today" : "",
                !isPresent && !special && unavailable ? "unavailable" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect(date)}
              disabled={
                !isPresent && !special && (unavailable || !canAddAttendance)
              }
              title={special?.label}
              aria-label={`${key}${special ? `, ${special.label ?? special.type}` : isAbsent ? ", absent" : unavailable ? ", unavailable" : ""}`}
            >
              <span>{date.getDate()}</span>
              {isPresent && <Check size={13} />}
              {isHoliday && <Flag size={12} />}
              {isSuspended && <CloudRain size={12} />}
            </button>
          );
        })}
      </div>
      <div className="calendar-legend">
        <span>
          <i className="legend-dot present-dot" />
          Present
        </span>
        <span>
          <i className="legend-dot holiday-dot" />
          Holiday
        </span>
        <span>
          <i className="legend-dot suspended-dot" />
          Suspended
        </span>
        <span>
          <i className="legend-dot absent-dot" />
          Absent
        </span>
        <span>
          <i className="legend-dot today-dot" />
          Today
        </span>
      </div>
    </section>
  );
}
