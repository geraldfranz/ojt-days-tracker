import { Check, Trash2, X } from "lucide-react";
import type { AttendanceRecord } from "../../store/useOjtStore";
import { displayDate } from "../../lib/date";
import { useEffect } from "react";
interface DialogProps {
  selected: string;
  existing?: AttendanceRecord;
  notes: string;
  setNotes: (value: string) => void;
  hoursLogged: number;
  setHoursLogged: (value: number) => void;
  onClose: () => void;
  onSave: () => void;
  onRemove: () => void;
}
export function AttendanceDialog({
  selected,
  existing,
  notes,
  setNotes,
  hoursLogged,
  setHoursLogged,
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
        <div className="selected-status">
          <Check size={17} />
          Present
        </div>
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
        <div className="modal-actions">
          {existing && (
            <button className="button danger" onClick={onRemove}>
              <Trash2 size={16} />
              Remove
            </button>
          )}
          <button className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" onClick={onSave}>
            Save attendance
          </button>
        </div>
      </div>
    </div>
  );
}
