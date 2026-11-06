
import { compareRoomNums } from "../../lib/compareRoomNums";
import { RoomMeeting } from "../../lib/coursesToClassrooms";
import { meetingTypes } from "../../lib/meeting-types";
import {
  isMeetingOngoing,
  doesMeetingHappen,
  useMoment,
} from "../../lib/moment-context";
import { useTimeRange } from "../../lib/timeRange";
import { Day } from "../../lib/Day";
import { Link } from "../Link";

export type RoomListProps = {
  building: string;
  rooms: Record<string, RoomMeeting[]>;
};

export function RoomList({ building, rooms }: RoomListProps) {
  const moment = useMoment();
  const selectedRange = useTimeRange();

  if (Object.keys(rooms).length === 0) {
    return (
      <div className="empty">
        <p>
          This building isn't used for any classes this week, as far as WebReg
          is concerned.
        </p>
      </div>
    );
  }

  return (
    <div className="room-list">
      <div className="rooms">
        {Object.entries(rooms)
          .sort(([a], [b]) => compareRoomNums(a, b))
          .map(([room, meetings]) => {
            // Use the same time standard as BuildingButton.
            const activeMeeting = meetings.find((meeting) => {
              if (!selectedRange) {
                return isMeetingOngoing(meeting, moment);
              }

              const selectedDay = Day.fromId(selectedRange.dayId);

              return (
                doesMeetingHappen(
                  meeting,
                  moment,
                  selectedDay,
                  meeting.special
                ) &&
                +meeting.time.start < selectedRange.endMin &&
                +meeting.time.end > selectedRange.startMin
              );
            });

            const soon =
              !selectedRange &&
              !!activeMeeting &&
              moment.time < activeMeeting.time.start;

            return (
              <Link
                key={room}
                view={{ type: "building", building, room }}
                className={`room ${
                  activeMeeting
                    ? soon
                      ? "soon"
                      : "active"
                    : "inactive"
                }`}
              >
                <div className="room-name">
                  {building} {room}
                </div>

                {moment.type !== "term" ? (
                  <div className="current-meeting">
                    {activeMeeting ? (
                      <>
                        {activeMeeting.course}{" "}
                        {soon ? (
                          "soon"
                        ) : (
                          <>
                            (
                            <abbr
                              title={`${
                                meetingTypes[activeMeeting.type]
                              } with up to ${
                                activeMeeting.capacity
                              } student${
                                activeMeeting.capacity === 1 ? "" : "s"
                              }`}
                            >
                              {activeMeeting.type}
                            </abbr>
                            )
                          </>
                        )}
                      </>
                    ) : (
                      "Available"
                    )}
                  </div>
                ) : null}
              </Link>
            );
          })}
      </div>
    </div>
  );
}
