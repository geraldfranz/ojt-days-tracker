import { Check, CloudRain, Flag, Trash2, X } from "lucide-react";
import type { AttendanceRecord, SpecialDateType } from "../../store/useOjtStore";
import { displayDate } from "../../lib/date";
import { useEffect } from "react";

export type EntryType = "present" | SpecialDateType;

interface DialogProps {
  selected: string;
  existing?: AttendanceRecord;
  entryType: EntryType;
  setEntryType: (value: EntryType) => void;
  notes: string;
  setNotes: (value: string) => void;
  hoursLogged: number;
  setHoursLogged: (value: number) => void;
  hasExistingEntry: boolean;
  onClose: () => void;
  onSave: () => void;
  onRemove: () => void;
}
const typeOptions: { value: EntryType; label: string; icon: typeof Check }[] = [
  { value: "present", label: "Present", icon: Check },
  { value: "suspended", label: "Suspended (bagyo/emergency)", icon: CloudRain },
  { value: "holiday", label: "Holiday", icon: Flag },
];
export function AttendanceDialog({
  selected,
  existing,
  entryType,
  setEntryType,
  notes,
  setNotes,
  hoursLogged,
  setHoursLogged,
  hasExistingEntry,
  onClose,
  onSave,
  onRemove,
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-dialog-title"
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">ATTENDANCE ENTRY</p>
            <h2 id="attendance-dialog-title">{displayDate(selected)}</h2>
          </div>
          <button
            className="icon-button subtle"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <label className="field-label">Status</label>
        <div className="type-picker" role="radiogroup" aria-label="Attendance type">
          {typeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={entryType === value}
              className={`type-option ${entryType === value ? "selected" : ""} ${value}`}
              onClick={() => setEntryType(value)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
        {entryType === "present" ? (
          <>
            <label className="field-label" htmlFor="hoursLogged">
              Hours logged
            </label>
            <input
              id="hoursLogged"
              type="number"
              min={0.5}
              max={24}
              step={0.5}
              value={hoursLogged}
              onChange={(event) =>
                setHoursLogged(Number(event.target.value) || 0)
              }
            />
            <label className="field-label" htmlFor="notes">
              Notes <span>Optional</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              maxLength={500}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What did you work on?"
              rows={4}
            />
            <small className="notes-limit">{notes.length}/500</small>
          </>
        ) : (
          <>
            <label className="field-label" htmlFor="notes">
              {entryType === "holiday" ? "Holiday name" : "Reason"}{" "}
              <span>Optional</span>
            </label>
            <input
              id="notes"
              type="text"
              maxLength={80}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={
                entryType === "holiday"
                  ? "e.g. Independence Day"
                  : "e.g. Typhoon Something — class/work suspended"
              }
            />
          </>
        )}
        <div className="modal-actions">
          {(existing || hasExistingEntry) && (
            <button className="button danger" onClick={onRemove}>
              <Trash2 size={16} />
              Remove
            </button>
          )}
          <button className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
