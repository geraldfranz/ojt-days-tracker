import { useEffect, useState } from "react";
import { Check, CloudRain, Flag, RotateCcw, Trash2, X } from "lucide-react";
import { useOjtStore } from "../store/useOjtStore";
import { Header } from "../components/layout/Header";
import { DEFAULT_START_DATE, displayDate, getToday, isValidDateKey } from "../lib/date";
const week = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export function SettingsPage() {
  const {
    userName,
    totalRequiredDays,
    hoursPerDay,
    startDate,
    workingDays,
    specialDates,
    updateSettings,
    resetData,
    setSpecialDate,
    removeSpecialDate,
    ensureHolidaysSeeded,
  } = useOjtStore();
  const today = getToday();
  useEffect(() => {
    ensureHolidaysSeeded(today.getFullYear());
    ensureHolidaysSeeded(today.getFullYear() + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensureHolidaysSeeded]);
  const [newDate, setNewDate] = useState("");
  const [newType, setNewType] = useState<"holiday" | "suspended">("holiday");
  const [newLabel, setNewLabel] = useState("");
  const [specialError, setSpecialError] = useState("");
  const sortedSpecialDates = [...specialDates].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const [name, setName] = useState(userName);
  const [hours, setHours] = useState(String(totalRequiredDays));
  const [hoursPerDayLocal, setHoursPerDayLocal] = useState(String(hoursPerDay));
  const [start, setStart] = useState(startDate);
  const [selectedDays, setSelectedDays] = useState(workingDays);
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const save = () => {
    if (!Number.isInteger(Number(hours)) || Number(hours) < 1) {
      setError(
        "Total required hours must be a whole number greater than zero.",
      );
      return;
    }
    if (
      !Number.isInteger(Number(hoursPerDayLocal)) ||
      Number(hoursPerDayLocal) < 1
    ) {
      setError("Hours per day must be a whole number greater than zero.");
      return;
    }
    if (!isValidDateKey(start)) {
      setError("Please enter a valid start date.");
      return;
    }
    if (!selectedDays.length) {
      setError("Select at least one working day.");
      return;
    }
    setError("");
    updateSettings({
      userName: name,
      totalRequiredDays: Math.max(1, Number(hours) || 1),
      hoursPerDay: Math.max(1, Number(hoursPerDayLocal) || 8),
      startDate: start,
      workingDays: selectedDays,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };
  const addSpecial = () => {
    if (!isValidDateKey(newDate)) {
      setSpecialError("Please choose a valid date.");
      return;
    }
    setSpecialError("");
    setSpecialDate(newDate, newType, newLabel);
    setNewDate("");
    setNewLabel("");
  };
  return (
    <div className="page">
      <Header eyebrow="PREFERENCES" title="Settings" />
      <section className="settings-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">YOUR PROGRAM</p>
            <h2>OJT information</h2>
          </div>
          <p>Keep your internship details up to date.</p>
        </div>
        <div className="settings-form">
          <label className="input-wrap">
            <span>Your name</span>
            <input
              type="text"
              maxLength={60}
              placeholder="e.g. Gerald"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="input-wrap">
            <span>Total required hours</span>
            <input
              type="number"
              min="1"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </label>
          <label className="input-wrap">
            <span>Hours per day</span>
            <input
              type="number"
              min="1"
              value={hoursPerDayLocal}
              onChange={(event) => setHoursPerDayLocal(event.target.value)}
            />
          </label>
          <label className="input-wrap">
            <span>Start date</span>
            <input
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </label>
        </div>
        <div className="working-days">
          <label className="field-label">Working days</label>
          <div className="day-pills">
            {week.map((day) => (
              <button
                key={day}
                className={`day-pill ${selectedDays.includes(day) ? "selected" : ""}`}
                onClick={() =>
                  setSelectedDays((current) =>
                    current.includes(day)
                      ? current.filter((item) => item !== day)
                      : [...current, day],
                  )
                }
              >
                <span>{selectedDays.includes(day) && <Check size={13} />}</span>
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary save-button" onClick={save}>
          <Check size={17} />
          {saved ? "Changes saved" : "Save changes"}
        </button>
      </section>
      <section className="settings-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">CALENDAR</p>
            <h2>Holidays &amp; suspensions</h2>
          </div>
          <p>
            Regular Philippine holidays are added automatically. Add local
            holidays or storm/emergency suspensions here — these days won't
            count toward your total absences.
          </p>
        </div>
        <div className="settings-form">
          <label className="input-wrap">
            <span>Date</span>
            <input
              type="date"
              value={newDate}
              onChange={(event) => setNewDate(event.target.value)}
            />
          </label>
          <label className="input-wrap">
            <span>Type</span>
            <select
              value={newType}
              onChange={(event) =>
                setNewType(event.target.value as "holiday" | "suspended")
              }
            >
              <option value="holiday">Holiday</option>
              <option value="suspended">Suspended (bagyo/emergency)</option>
            </select>
          </label>
          <label className="input-wrap">
            <span>
              Label <span>Optional</span>
            </span>
            <input
              type="text"
              maxLength={80}
              placeholder="e.g. Typhoon Something"
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
            />
          </label>
        </div>
        {specialError && (
          <p className="form-error" role="alert">
            {specialError}
          </p>
        )}
        <button
          className="button secondary add-holiday-button"
          onClick={addSpecial}
        >
          Add to calendar
        </button>
        <ul className="special-dates-list">
          {sortedSpecialDates.length === 0 && (
            <li className="special-dates-empty">No holidays added yet.</li>
          )}
          {sortedSpecialDates.map((item) => (
            <li key={item.id} className={`special-date-row ${item.type}`}>
              <span className="special-date-icon">
                {item.type === "holiday" ? (
                  <Flag size={14} />
                ) : (
                  <CloudRain size={14} />
                )}
              </span>
              <span className="special-date-info">
                <strong>{displayDate(item.date, { month: "short", day: "numeric" })}</strong>
                <small>{item.label || (item.type === "holiday" ? "Holiday" : "Suspended")}</small>
              </span>
              <button
                className="icon-button subtle"
                onClick={() => removeSpecialDate(item.id)}
                aria-label={`Remove ${item.label || item.type}`}
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="danger-section">
        <div>
          <p className="eyebrow">DANGER ZONE</p>
          <h2>Reset all data</h2>
          <p>Remove all attendance records and restore the default settings.</p>
        </div>
        <button className="button danger" onClick={() => setConfirm(true)}>
          <RotateCcw size={16} />
          Reset data
        </button>
      </section>
      {confirm && (
        <div className="modal-backdrop">
          <div
            className="modal confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
          >
            <span className="confirm-icon">
              <Trash2 size={20} />
            </span>
            <h2 id="reset-dialog-title">Reset all data?</h2>
            <p>
              This will permanently remove your attendance and restore your
              default OJT settings.
            </p>
            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="button danger"
                onClick={() => {
                  resetData();
                  setName("");
                  setHours("480");
                  setHoursPerDayLocal("8");
                  setStart(DEFAULT_START_DATE);
                  setSelectedDays(week.slice(0, 5));
                  setConfirm(false);
                }}
              >
                Reset everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
