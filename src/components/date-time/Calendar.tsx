import { memo, ReactNode, useEffect, useRef, useState } from "react";
import { Day, DayId } from "../../lib/Day";
import { getTermDays, seasons, TermDays } from "../../lib/terms";
import {
  CalendarHeaderRow,
  CalendarMonthHeadingRow,
  CalendarQuarterHeadingRow,
  CalendarRow,
  CalendarWeekRow,
} from "./CalendarRow";

/**
 * - `none` means not to scroll to the date. This is if you're selecting the
 *   date by clicking on the calendar, so that it doesn't force you to the date
 *   while you're trying to scroll.
 * - `init` means to instantly scroll to the date. This is only used when the
 *   app starts, so the calendar opens with the current day in view.
 * - `date-edited` means to smooth scroll to the date. When entering in the date
 *   through the date input or today button, it will scroll to the date.
 */
export type ScrollMode = "none" | "init" | "date-edited";

/** Height of the calendar header. */
const HEADER_HEIGHT = 90;

// Awkward transition to `DayId` because it helps useMemo
type MonthCalendarProps = {
  termDaysStart: DayId;
  termDaysFinals: DayId;
  termDaysEnd: DayId;
  /** Only specify if `date` is in the month */
  date?: DayId;
  onDate_s: (date: Day) => void;
  monthStart: DayId;
  monthEnd: DayId;
  scrollMode: ScrollMode;
};
function MonthCalendar_({
  termDaysStart,
  termDaysFinals,
  termDaysEnd,
  date,
  onDate_s,
  monthStart,
  monthEnd,
  scrollMode,
}: MonthCalendarProps) {
  const dateInMonth = date !== undefined;

  const termDays = {
    start: Day.fromId(termDaysStart),
    finals: Day.fromId(termDaysFinals),
    end: Day.fromId(termDaysEnd),
  };
  const monthStartDay = Day.fromId(monthStart);
  const monthEndDay = Day.fromId(monthEnd);

  const weeks: ReactNode[] = [];
  for (
    let monday = monthStartDay.monday;
    monday <= monthEndDay;
    monday = monday.add(7)
  ) {
    weeks.push(
      <CalendarWeekRow
        key={monday.id}
        termDays={termDays}
        start={monthStartDay}
        end={monthEndDay}
        monday={monday}
        date={date !== undefined ? Day.fromId(date) : undefined}
        onDate={onDate_s}
      />
    );
  }

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const div = ref.current;
    if (div?.parentElement && scrollMode !== "none" && dateInMonth) {
      div.parentElement.scrollTo({
        top: div.offsetTop - HEADER_HEIGHT,
        // `scrollToDate` is only 1 when the web page first loads
        behavior: scrollMode === "init" ? "auto" : "smooth",
      });
    }
  }, [scrollMode, dateInMonth, monthStart, monthEnd]);

  return (
    <div className="calendar-month" ref={ref}>
      <CalendarMonthHeadingRow month={monthStartDay.month} />
      {weeks}
    </div>
  );
}
const MonthCalendar = memo(MonthCalendar_);

type TermCalendarProps = {
  termDays: TermDays;
  start: Day;
  end: Day;
  date: Day;
  onDate_s: (date: Day) => void;
  scrollMode: ScrollMode;
};
function TermCalendar({
  termDays,
  start,
  end,
  date,
  onDate_s,
  scrollMode,
}: TermCalendarProps) {
  const months: ReactNode[] = [];
  for (let month = start.month; month <= end.month; month++) {
    const monthStart = Day.max(start, Day.from(start.year, month, 1));
    const monthEnd = Day.min(end, Day.from(start.year, month + 1, 0));
    months.push(
      <MonthCalendar
        key={month}
        termDaysStart={termDays.start.id}
        termDaysFinals={termDays.finals.id}
        termDaysEnd={termDays.end.id}
        date={monthStart <= date && date <= monthEnd ? date.id : undefined}
        onDate_s={onDate_s}
        monthStart={monthStart.id}
        monthEnd={monthEnd.id}
        scrollMode={scrollMode}
      />
    );
  }
  return <>{months}</>;
}


type WeeklyCalendarProps = {
  date: Day;
  onDate_s: (date: Day) => void;
};

function WeeklyCalendar({ date, onDate_s }: WeeklyCalendarProps) {
  // CalendarWeekRow renders Monday through Sunday using these bounds.
  const sunday = date.sunday;
  const monday = sunday.add(1);

  const termDays = seasons
    .map((season) => getTermDays(date.year, season))
    .find((term) => term.start <= date && date <= term.end);

  // A week can cross an academic-term boundary. If the selected date
  // isn't in a term, use the term containing the week's Monday instead.
  const weekTermDays =
    termDays ??
    seasons
      .map((season) => getTermDays(monday.year, season))
      .find((term) => term.start <= monday && monday <= term.end) ??
    getTermDays(date.year, seasons[0]);

  return (
    <div className="calendar-scroll-area weekly-calendar">
      <CalendarHeaderRow />
      <div className="calendar-month">
        <CalendarMonthHeadingRow month={date.month} />
        <CalendarWeekRow
          termDays={weekTermDays}
          start={sunday}
          end={sunday.add(6)}
          monday={sunday.add(1)}
          date={date}
          onDate={onDate_s}
        />
      </div>
    </div>
  );
}

export type CalendarProps = {
  date: Day;
  onDate_s: (date: Day, scrollToDate?: boolean) => void;
  scrollMode: ScrollMode;
  freeScroll: () => void;
};
export function Calendar({ freeScroll, ...props }: CalendarProps) {
  const { date, scrollMode } = props;
  const selectedStart = date.month <= 6 ? date.year - 1 : date.year;
  const selectedEnd = date.month >= 9 ? date.year + 1 : date.year;
  const [start, setStart] = useState(selectedStart);
  const [end, setEnd] = useState(selectedEnd);
  // This implementation sucks, but useEffect isn't ideal because I also want to
  // render the new start/end immediately so the month can be scrolled to in the
  // correct position.
  if (scrollMode === "date-edited") {
    if (start !== selectedStart) {
      setStart(selectedStart);
    }
    if (end !== selectedEnd) {
      setEnd(selectedEnd);
    }
  }

  // Move focus to currently selected calendar day (this is still finicky)
  useEffect(() => {
    if (
      document.activeElement instanceof HTMLInputElement &&
      document.activeElement.name === "calendar-day" &&
      !document.activeElement.checked
    ) {
      const checked = document.querySelector('[name="calendar-day"]:checked');
      if (checked instanceof HTMLInputElement) {
        checked.focus();
      }
    }
  }, [date.id]);

  const calendars: ReactNode[] = [];
  for (let year = start; year <= end; year++) {
    const yearTermDays = seasons.map((season) => getTermDays(year, season));
    for (const [i, season] of seasons.entries()) {
      calendars.push(
        <CalendarQuarterHeadingRow
          year={year}
          season={season}
          key={`${year} ${season} heading`}
        />,
        <TermCalendar
          termDays={yearTermDays[i]}
          start={i === 0 ? Day.from(year, 1, 1) : yearTermDays[i].start.monday}
          end={
            yearTermDays[i + 1]?.start.monday.add(-1) ??
            Day.from(year + 1, 1, 0)
          }
          key={`${year} ${season}`}
          {...props}
        />
      );
    }
  }

  return (
    <WeeklyCalendar
      date={date}
      onDate_s={props.onDate_s}
    />
  );
}
