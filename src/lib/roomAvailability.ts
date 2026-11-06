
import { RoomMeeting } from "./coursesToClassrooms";
import { Day } from "./Day";
import {
  doesMeetingHappen,
  isMeetingOngoing,
  TermMoment,
} from "./moment-context";
import { TimeRange } from "./timeRange";

export function findBlockingMeeting(
  meetings: RoomMeeting[],
  moment: TermMoment,
  range: TimeRange | null
): RoomMeeting | undefined {
  if (!range) {
    return meetings.find((meeting) =>
      isMeetingOngoing(meeting, moment, 10)
    );
  }

  const day = Day.fromId(range.dayId);

  return meetings.find(
    (meeting) =>
      doesMeetingHappen(meeting, moment, day, meeting.special) &&
      +meeting.time.start < range.endMin &&
      +meeting.time.end > range.startMin
  );
}
