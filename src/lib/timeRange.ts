import { useSyncExternalStore } from "react";
import { DayId } from "./Day";

/** endMin is exclusive: 10:30–11:00 AM is startMin 630, endMin 660. */
export type TimeRange = { dayId: DayId; startMin: number; endMin: number };

let current: TimeRange | null = null;
const listeners = new Set<() => void>();

export function getTimeRange() {
  return current;
}

export function setTimeRange(range: TimeRange | null) {
  current = range;
  listeners.forEach((l) => l());
}

export function useTimeRange() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current
  );
}