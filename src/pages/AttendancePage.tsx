import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useOjtStore } from "../store/useOjtStore";
import { getToday, dateKey } from "../lib/date";
import {
  calculateCompletedDays,
  calculateTotalHoursLogged,
  isValidAttendanceDate,
} from "../lib/ojtCalculations";
import { Header } from "../components/layout/Header";
import { AttendanceCalendar } from "../components/attendance/AttendanceCalendar";
import {
  AttendanceDialog,
  type EntryType,
} from "../components/attendance/AttendanceDialog";
export function AttendancePage() {
  const {
    attendanceRecords,
    specialDates,
    totalRequiredDays,
    hoursPerDay,
    startDate,
    workingDays,
    addAttendance,
    updateAttendance,
    removeAttendance,
    setSpecialDate,
    removeSpecialDate,
    ensureHolidaysSeeded,
  } = useOjtStore();
  const today = getToday();
  const requiredDays = totalRequiredDays / hoursPerDay;
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<EntryType>("present");
  const [notes, setNotes] = useState("");
  const [hoursLogged, setHoursLogged] = useState(hoursPerDay);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const existing = attendanceRecords.find((record) => record.date === selected);
  const existingSpecial = specialDates.find((item) => item.date === selected);

  // Make sure PH regular holidays exist for whichever year is being viewed.
  useEffect(() => {
    ensureHolidaysSeeded(month.getFullYear());
  }, [month, ensureHolidaysSeeded]);

  // Memoized so the same derived values aren't recomputed on every
  // access within a single render.
  const completedDays = useMemo(
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

  const select = (date: Date) => {
    const value = dateKey(date);
    const existingRecord = attendanceRecords.find(
      (record) => record.date === value,
    );
    const existingSpecialForDate = specialDates.find(
      (item) => item.date === value,
    );
    setError("");
    setSelected(value);
    setNotes(existingRecord?.notes || existingSpecialForDate?.label || "");
    setHoursLogged(existingRecord?.hoursLogged ?? hoursPerDay);
    setEntryType(
      existingSpecialForDate ? existingSpecialForDate.type : "present",
    );
  };
  const save = () => {
    if (!selected) return;

    if (entryType !== "present") {
      setSpecialDate(selected, entryType, notes);
      setSelected(null);
      return;
    }

    if (
      !existing &&
      !isValidAttendanceDate(selected, startDate, workingDays, today)
    ) {
      setError(
        "Cannot mark attendance on this date. Choose a working day on or after your OJT start date.",
      );
      return;
    }
    if (!existing && completedDays >= requiredDays) {
      setError("Your required OJT hours are complete.");
      return;
    }
    if (existing) {
      updateAttendance(existing.id, { notes, hoursLogged });
    } else {
      addAttendance({ date: selected, status: "present", notes, hoursLogged });
    }
    setSelected(null);
  };
  const remove = () => {
    if (existing) {
      setDeleteId(existing.id);
    } else if (existingSpecial) {
      removeSpecialDate(existingSpecial.id);
      setSelected(null);
    }
  };
  return (
    <div className="page">
      <Header
        eyebrow="YOUR LOG"
        title="Attendance"
        action={
          <button
            className="icon-button"
            onClick={() => select(today)}
            aria-label="Add attendance"
          >
            <Plus size={20} />
          </button>
        }
      />
      <AttendanceCalendar
        month={month}
        setMonth={setMonth}
        presentDates={attendanceRecords.map((record) => record.date)}
        specialDates={specialDates}
        onSelect={select}
        startDate={startDate}
        workingDays={workingDays}
        canAddAttendance={completedDays < requiredDays}
      />
      <p className="calendar-count">{totalHoursLogged} hours logged</p>
      <section className="attendance-tip">
        <span className="tip-icon">✦</span>
        <div>
          <strong>Nice and steady</strong>
          <p>
            Tap any date to add or update your attendance, or mark it as a
            holiday/suspension.
          </p>
        </div>
      </section>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {selected && (
        <AttendanceDialog
          selected={selected}
          existing={existing}
          entryType={entryType}
          setEntryType={setEntryType}
          notes={notes}
          setNotes={setNotes}
          hoursLogged={hoursLogged}
          setHoursLogged={setHoursLogged}
          hasExistingEntry={Boolean(existing || existingSpecial)}
          onClose={() => setSelected(null)}
          onSave={save}
          onRemove={remove}
        />
      )}
      {deleteId && (
        <div className="modal-backdrop">
          <div
            className="modal confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-attendance-title"
          >
            <span className="confirm-icon">!</span>
            <h2 id="delete-attendance-title">Delete attendance?</h2>
            <p>This will remove this attendance record and its notes.</p>
            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="button danger"
                onClick={() => {
                  removeAttendance(deleteId);
                  setDeleteId(null);
                  setSelected(null);
                }}
              >
                Delete record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
