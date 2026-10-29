import { useEffect, useRef } from "react";
import { Day } from "../../lib/Day";
import { Time } from "../../lib/Time";
import { inPT } from "../../lib/now";
import {
  getTimeRange,
  setTimeRange,
  TimeRange,
  useTimeRange,
} from "../../lib/timeRange";

const SLOT_MINUTES = 30;
const SLOTS_PER_DAY = 48;
// Must be half of the 60px hour row in style.css
const SLOT_HEIGHT = 30;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function minutesToTime(mins: number) {
  // Assumes new Time(hour, minute). If this errors, check lib/Time.ts.
  return new Time(Math.floor(mins / 60) % 24, mins % 60);
}

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export type DateTimePanelProps = {
  date: Day;
  onDate: (date: Day) => void;
  time: Time;
  onTime: (customTime: Time) => void;
  onSelection: (range: TimeRange) => void;
  useNow: boolean;
  onUseNow: (useNow: boolean) => void;
  visible: boolean;
  closeable: boolean;
  className: string;
  onClose: () => void;
};
export function DateTimePanel({
  date,
  onDate,
  time,
  onTime,
  onSelection,
  useNow,
  onUseNow,
  visible,
  closeable,
  className,
  onClose,
}: DateTimePanelProps) {
  const range = useTimeRange();

  // Called while dragging: applies the selection to the app immediately.
const handleRange = (next: TimeRange) => {
  const prev = getTimeRange();
    if (
    prev &&
    prev.dayId === next.dayId &&
    prev.startMin === next.startMin &&
    prev.endMin === next.endMin
  ) {
    return;
  }

  setTimeRange(next);

  if (
    useNow ||
    !prev ||
    prev.dayId !== next.dayId ||
    prev.startMin !== next.startMin
  ) {
    onSelection(next);
  }
};

  const handleGridDate = (d: Day) => {
    onUseNow(false);
    onDate(d);
  };

  return (
    <form
      className={`date-time-panel ${
        visible ? "" : "date-time-panel-hidden"
      } ${className} calendar-open`}
      onSubmit={(e) => {
        onClose();
        e.preventDefault();
      }}
    >
      <div className="date-time-flex">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={useNow}
            onChange={(e) => {
              onUseNow(e.currentTarget.checked);
              if (e.currentTarget.checked) setTimeRange(null);
            }}
          />
          <span>
            Use current time
            {inPT() ? null : <span className="tz-note">(in San Diego)</span>}
          </span>
        </label>
        {date.id !== Day.today().id && (
          <button
            type="button"
            className="today-btn"
            onClick={() => onDate(Day.today())}
          >
            Today
          </button>
        )}
        {closeable && (
          <button className="filled-icon-btn close-date-btn">Close</button>
        )}
      </div>

      <div className="date-time-flex">
        <button
          type="button"
          className="week-nav-btn"
          onClick={() => onDate(date.add(-7))}
        >
          ‹
        </button>
        <input
          type="date"
          name="date"
          value={date.toString()}
          onChange={(e) => {
            const d = Day.parse(e.currentTarget.value);
            if (d) {
              if (useNow) onUseNow(false);
              onDate(d);
            }
          }}
          className="date-input"
        />
        <button
          type="button"
          className="week-nav-btn"
          onClick={() => onDate(date.add(7))}
        >
          ›
        </button>
      </div>

      <WeeklyTimeGrid
        date={date}
        onDate={handleGridDate}
        range={range}
        onRange={handleRange}
      />
    </form>
  );
}

type WeeklyTimeGridProps = {
  date: Day;
  onDate: (date: Day) => void;
  range: TimeRange | null;
  onRange: (range: TimeRange) => void;
};
function WeeklyTimeGrid({ date, onDate, range, onRange }: WeeklyTimeGridProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const sunday = date.sunday;
  const weekDates = Array.from({ length: 7 }, (_, i) => sunday.add(i));
  const drag = useRef<{ anchor: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Open scrolled to 8 AM instead of midnight
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 8 * 2 * SLOT_HEIGHT;
    }
  }, []);

  const slotAt = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const slot = Math.floor((e.clientY - rect.top) / SLOT_HEIGHT);
    return Math.min(SLOTS_PER_DAY - 1, Math.max(0, slot));
  };

  return (
    <div className="weekly-time-grid" ref={scrollRef}>
      <div className="weekly-time-grid-header">
        <div className="weekly-time-gutter" />
        {weekDates.map((d, i) => (
          <div
            className={`weekly-time-day ${
              d.id === date.id ? "weekly-time-day-selected" : ""
            }`}
            key={d.id}
          >
            <div>{DAY_NAMES[i]}</div>
            <div>{d.date}</div>
          </div>
        ))}
      </div>

      <div className="weekly-time-grid-body">
        <div className="weekly-time-labels">
          {hours.map((hour) => (
            <div className="weekly-time-label" key={hour}>
              {hour === 0
                ? "12 AM"
                : hour < 12
                ? `${hour} AM`
                : hour === 12
                ? "12 PM"
                : `${hour - 12} PM`}
            </div>
          ))}
        </div>

        {weekDates.map((d) => (
          <div
            className="weekly-time-column"
            key={d.id}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const slot = slotAt(e);
              drag.current = { anchor: slot };
              onRange({
                dayId: d.id,
                startMin: slot * SLOT_MINUTES,
                endMin: (slot + 1) * SLOT_MINUTES,
              });
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              const slot = slotAt(e);
              const lo = Math.min(drag.current.anchor, slot);
              const hi = Math.max(drag.current.anchor, slot);
              onRange({
                dayId: d.id,
                startMin: lo * SLOT_MINUTES,
                endMin: (hi + 1) * SLOT_MINUTES,
              });
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            {hours.map((hour) => (
              <div className="weekly-time-slot" key={hour} />
            ))}
            {range && range.dayId === d.id && (
              <div
                className="weekly-time-selection"
                style={{
                  top: (range.startMin / SLOT_MINUTES) * SLOT_HEIGHT,
                  height:
                    ((range.endMin - range.startMin) / SLOT_MINUTES) *
                    SLOT_HEIGHT,
                }}
              >
                {formatMinutes(range.startMin)} – {formatMinutes(range.endMin)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
