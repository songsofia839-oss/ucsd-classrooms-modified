import { useMoment } from "../../lib/moment-context";
import { termCode, termName } from "../../lib/terms";
import { useTimeRange } from "../../lib/timeRange";

const dayFormat = new Intl.DateTimeFormat([], { dateStyle: "short" });
const timeFormat = new Intl.DateTimeFormat([], { timeStyle: "short" });

export type DateTimeButtonProps = {
  onClick: () => void;
  disabled: boolean;
};
export function DateTimeButton({ onClick, disabled }: DateTimeButtonProps) {
  const {
    date,
    time,
    currentTerm: { year, season, current, week },
    type,
  } = useMoment();
  const range = useTimeRange();

  const start = date.toLocal(time.hour, time.minute);
  let label = `${dayFormat.format(start)}, ${timeFormat.format(start)}`;
  if (
    range &&
    range.dayId === date.id &&
    range.startMin === time.hour * 60 + time.minute
  ) {
    const end =
      range.endMin >= 1440
        ? date.add(1).toLocal(0, 0)
        : date.toLocal(Math.floor(range.endMin / 60), range.endMin % 60);
    label += ` – ${timeFormat.format(end)}`;
  }

  return (
    <button className="date-time-button" onClick={onClick} disabled={disabled}>
      <div className="showing-schedule-wrapper">
        <span className="showing-schedule-text">Showing schedules for</span>
        {type !== "term" ? (
          <>
            <div className="date-time">{label}</div>
            {current && (
              <span className="quarter-week">
                {termCode(year, season)}{" "}
                {week <= 10 ? `Week ${week}` : "Finals"} {date.dayName("short")}
              </span>
            )}
          </>
        ) : (
          <div className="selected-term">{termName(year, season, true)}</div>
        )}
      </div>
      <div className="filled-icon-btn edit-icon">Edit</div>
    </button>
  );
}