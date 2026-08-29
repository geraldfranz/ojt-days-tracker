import { useMemo } from "react";
import { Check, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOjtStore } from "../store/useOjtStore";
import { getToday, dateKey, displayDate } from "../lib/date";
import {
  calculateAbsentDays,
  calculateCompletedDays,
  calculateTotalHoursLogged,
  isValidAttendanceDate,
} from "../lib/ojtCalculations";
import { Header } from "../components/layout/Header";
import { StatCard } from "../components/dashboard/StatCard";

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const {
    userName,
    totalRequiredDays,
    hoursPerDay,
    startDate,
    workingDays,
    attendanceRecords,
  } = useOjtStore();
  const today = getToday();
  const requiredDays = totalRequiredDays / hoursPerDay;
  const completed = useMemo(
    () =>
      calculateCompletedDays(
        attendanceRecords,
        requiredDays,
        startDate,
        workingDays,
        today,
      ),
    [attendanceRecords, requiredDays, startDate, workingDays, today],
  );
  const totalHoursLogged = useMemo(
    () =>
      calculateTotalHoursLogged(attendanceRecords, startDate, workingDays, today),
    [attendanceRecords, startDate, workingDays, today],
  );
  const absentDays = useMemo(
    () => calculateAbsentDays(attendanceRecords, startDate, workingDays, today),
    [attendanceRecords, startDate, workingDays, today],
  );
  const remainingHours = Math.max(0, totalRequiredDays - totalHoursLogged);
  const progress = Math.round(
    totalRequiredDays > 0
      ? Math.min(100, Math.max(0, (totalHoursLogged / totalRequiredDays) * 100))
      : 0,
  );
  const presentToday = attendanceRecords.some(
    (record) =>
      record.date === dateKey(today) &&
      isValidAttendanceDate(record.date, startDate, workingDays, today),
  );
  const navigate = useNavigate();
  return (
    <div className="page">
      <Header
        eyebrow={displayDate(dateKey(today), {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }).toUpperCase()}
        title={`${getGreeting(today.getHours())}, ${userName || "there"}`}
        action={
          <span className="header-avatar">
            {(userName || "?").charAt(0).toUpperCase()}
          </span>
        }
      />
      <section className="welcome-banner">
        <div>
          <b>YOUR OJT JOURNEY</b>
          <h2>Small steps, big progress.</h2>
          <p>Keep showing up. You are building something great.</p>
        </div>
        <span className="banner-sun">✦</span>
      </section>
      <div className="stats-grid">
        <StatCard
          label="Completed"
          value={totalHoursLogged}
          detail="hours logged"
          tone="green"
        />
        <StatCard
          label="Total hours"
          value={totalRequiredDays}
          detail="hours required"
          tone="yellow"
        />
        <StatCard
          label="Remaining"
          value={remainingHours}
          detail="hours to go"
          tone="blue"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">OVERVIEW</p>
              <h2>OJT progress</h2>
            </div>
            <strong className="progress-percent">{progress}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-meta">
            <span>
              {totalHoursLogged} of {totalRequiredDays} hours completed
            </span>
            <span>{remainingHours} remaining</span>
          </div>
          <div className="milestone">
            <span className="milestone-icon">
              <Check size={16} />
            </span>
            <div>
              <strong>Keep your momentum</strong>
              <small>
                Your next milestone is{" "}
                {Math.round(Math.min(completed + 5, requiredDays) * hoursPerDay)} hours.
              </small>
            </div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">TODAY</p>
              <h2>
                {displayDate(dateKey(today), {
                  month: "short",
                  day: "numeric",
                })}
              </h2>
            </div>
            <span
              className={`status-badge ${presentToday ? "is-present" : ""}`}
            >
              {presentToday ? "Present" : "Not marked"}
            </span>
          </div>
          {presentToday ? (
            <div className="marked-message">
              <Check size={24} />
              <div>
                <strong>You're all checked in.</strong>
                <small>Attendance logged for today.</small>
              </div>
            </div>
          ) : (
            <div className="empty-today">
              <p>No attendance record for today.</p>
              <button
                className="button primary"
                onClick={() => navigate("/attendance")}
              >
                <Plus size={17} />
                Mark present
              </button>
            </div>
          )}
        </section>
      </div>
      <section className="summary-row">
        <div>
          <span className="summary-icon orange">↗</span>
          <span>
            <strong>{Math.ceil(requiredDays)} days</strong>
            <small>Total days</small>
          </span>
        </div>
        <div>
          <span className="summary-icon purple">✓</span>
          <span>
            <strong>{totalHoursLogged} hours</strong>
            <small>Total logged</small>
          </span>
        </div>
        <div>
          <span className="summary-icon teal">→</span>
          <span>
            <strong>{absentDays} days</strong>
            <small>Total absent</small>
          </span>
        </div>
      </section>
    </div>
  );
}
