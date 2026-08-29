import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { dateKey, getToday } from "../../lib/date";
import { isValidAttendanceDate } from "../../lib/ojtCalculations";

const week = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
interface CalendarProps {
  month: Date;
  setMonth: (month: Date) => void;
  presentDates: string[];
  onSelect: (date: Date) => void;
  startDate: string;
  workingDays: string[];
  canAddAttendance: boolean;
}
export function AttendanceCalendar({
  month,
  setMonth,
  presentDates,
  onSelect,
  startDate,
  workingDays,
  canAddAttendance,
}: CalendarProps) {
  const today = getToday();
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
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
        {days.map((date, index) =>
          date ? (
            <button
              key={dateKey(date)}
              className={`day ${presentDates.includes(dateKey(date)) ? "present" : ""} ${dateKey(date) === dateKey(today) ? "today" : ""} ${!isValidAttendanceDate(dateKey(date), startDate, workingDays, today) ? "unavailable" : ""}`}
              onClick={() => onSelect(date)}
              disabled={
                !presentDates.includes(dateKey(date)) &&
                (!isValidAttendanceDate(
                  dateKey(date),
                  startDate,
                  workingDays,
                  today,
                ) ||
                  !canAddAttendance)
              }
              aria-label={`${dateKey(date)}${!isValidAttendanceDate(dateKey(date), startDate, workingDays, today) ? ", unavailable" : ""}`}
            >
              <span>{date.getDate()}</span>
              {presentDates.includes(dateKey(date)) && <Check size={13} />}
            </button>
          ) : (
            <span key={`empty-${index}`} />
          ),
        )}
      </div>
      <div className="calendar-legend">
        <span>
          <i className="legend-dot present-dot" />
          Present
        </span>
        <span>
          <i className="legend-dot today-dot" />
          Today
        </span>
      </div>
    </section>
  );
}
