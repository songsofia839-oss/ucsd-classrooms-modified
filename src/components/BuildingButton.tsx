
import { useCallback } from "react";
import { BuildingDatum } from "../lib/buildings";
import { RoomMeeting } from "../lib/coursesToClassrooms";
import {
  PADDING,
  latLongToPixel,
  northeast,
  southwest,
} from "../lib/locations";
import { useMoment } from "../lib/moment-context";
import { useTimeRange } from "../lib/timeRange";
import { findBlockingMeeting } from "../lib/roomAvailability";
import { Link } from "./Link";

type BuildingButtonProps = {
  building: BuildingDatum;
  rooms: RoomMeeting[][];
  selected: boolean;
  scrollTarget: { init: boolean } | null;
  visible: boolean;
};

export function BuildingButton({
  building,
  rooms,
  selected,
  scrollTarget,
  visible,
}: BuildingButtonProps) {
  const moment = useMoment();
  const selectedRange = useTimeRange();

  // Count rooms available for the entire selected time range.
  const availableCount = rooms.filter(
    (meetings) =>
      !findBlockingMeeting(meetings, moment, selectedRange)
  ).length;

  const college = building.college;

  const ref = useCallback(
    (button: HTMLAnchorElement | null) => {
      if (scrollTarget && button) {
        window.requestAnimationFrame(() => {
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          const panelHeight = scrollTarget.init
            ? 0
            : windowHeight * (windowWidth <= 690 ? 0.7 : 0.6);

          const { left, top, width, height } =
            button.getBoundingClientRect();

          button.closest(".buildings")?.scrollBy({
            left: left + (-windowWidth + width) / 2,
            top:
              top +
              (-(windowHeight - panelHeight) + height) / 2,
            behavior: scrollTarget.init ? "auto" : "smooth",
          });
        });
      }
    },
    [scrollTarget]
  );

  const { x, y } = latLongToPixel(building.location);

  return (
    <Link
      view={{
        type: "building",
        building: building.code,
      }}
      className={`building-btn college-${college} ${
        selected ? "selected" : ""
      } ${visible ? "" : "building-btn-hidden"}`}
      style={{
        left: `calc(${
          x - southwest.x + PADDING.horizontal
        }px * var(--map-zoom))`,
        top: `calc(${
          y - northeast.y + PADDING.top
        }px * var(--map-zoom))`,
      }}
      elemRef={ref}
    >
      {building.code}

      <span className="room-count">
        {moment.type !== "term" ? (
          <>
            <span className="in-use">
              {availableCount}
            </span>
            /{rooms.length}
          </>
        ) : (
          <span className="in-use">
            {rooms.length}
          </span>
        )}
      </span>
    </Link>
  );
}
