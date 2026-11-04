
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 1.5;

export function ZoomableMap({ children }: { children: ReactNode }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const [zoom, setZoom] = useState(1);

  const clamp = (value: number) =>
    Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));

  const applyZoom = (
    value: number,
    contentX: number,
    contentY: number,
    screenX: number,
    screenY: number
  ) => {
    const map = mapRef.current;
    if (!map) return;

    const next = clamp(value);
    zoomRef.current = next;

    map.style.setProperty("--map-zoom", String(next));
    map.scrollLeft = contentX * next - screenX;
    map.scrollTop = contentY * next - screenY;

    setZoom(next);
  };

  const zoomAt = (value: number, clientX?: number, clientY?: number) => {
    const map = mapRef.current;
    if (!map) return;

    const rect = map.getBoundingClientRect();
    const x = clientX === undefined
      ? map.clientWidth / 2
      : clientX - rect.left;
    const y = clientY === undefined
      ? map.clientHeight / 2
      : clientY - rect.top;

    const current = zoomRef.current;

    applyZoom(
      value,
      (map.scrollLeft + x) / current,
      (map.scrollTop + y) / current,
      x,
      y
    );
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let pinch: {
      distance: number;
      zoom: number;
      contentX: number;
      contentY: number;
    } | null = null;

    let gestureZoom = 1;

    const distance = (touches: TouchList) =>
      Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );

    const midpoint = (touches: TouchList) => {
      const rect = map.getBoundingClientRect();
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2 - rect.left,
        y: (touches[0].clientY + touches[1].clientY) / 2 - rect.top,
      };
    };

    const start = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;

      const center = midpoint(e.touches);
      const current = zoomRef.current;

      pinch = {
        distance: distance(e.touches) || 1,
        zoom: current,
        contentX: (map.scrollLeft + center.x) / current,
        contentY: (map.scrollTop + center.y) / current,
      };
    };

    const move = (e: TouchEvent) => {
      if (!pinch || e.touches.length !== 2) return;
      e.preventDefault();

      const center = midpoint(e.touches);

      applyZoom(
        pinch.zoom * distance(e.touches) / pinch.distance,
        pinch.contentX,
        pinch.contentY,
        center.x,
        center.y
      );
    };

    const end = (e: TouchEvent) => {
      if (e.touches.length < 2) pinch = null;
    };

    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      zoomAt(
        zoomRef.current * Math.exp(-e.deltaY * 0.01),
        e.clientX,
        e.clientY
      );
    };

    type SafariGesture = Event & {
      scale: number;
      clientX: number;
      clientY: number;
    };

    const gestureStart = (e: Event) => {
      e.preventDefault();
      gestureZoom = zoomRef.current;
    };

    const gestureChange = (e: Event) => {
      e.preventDefault();
      if (pinch) return;

      const gesture = e as SafariGesture;
      zoomAt(
        gestureZoom * gesture.scale,
        gesture.clientX,
        gesture.clientY
      );
    };

    map.addEventListener("touchstart", start, { passive: true });
    map.addEventListener("touchmove", move, { passive: false });
    map.addEventListener("touchend", end);
    map.addEventListener("touchcancel", end);
    map.addEventListener("wheel", wheel, { passive: false });
    map.addEventListener("gesturestart", gestureStart);
    map.addEventListener("gesturechange", gestureChange);

    return () => {
      map.removeEventListener("touchstart", start);
      map.removeEventListener("touchmove", move);
      map.removeEventListener("touchend", end);
      map.removeEventListener("touchcancel", end);
      map.removeEventListener("wheel", wheel);
      map.removeEventListener("gesturestart", gestureStart);
      map.removeEventListener("gesturechange", gestureChange);
    };
  }, []);

  return (
    <>
      <div
        className="buildings"
        ref={mapRef}
        style={{ "--map-zoom": zoom } as CSSProperties}
        onDoubleClick={(e) => {
          if (!(e.target as Element).closest(".building-btn")) {
            zoomAt(zoomRef.current * ZOOM_STEP, e.clientX, e.clientY);
          }
        }}
      >
        {children}
      </div>

      <div className="map-zoom-buttons">
        <button
          type="button"
          aria-label="Zoom in"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => zoomAt(zoomRef.current * ZOOM_STEP)}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => zoomAt(zoomRef.current / ZOOM_STEP)}
        >
          −
        </button>
      </div>
    </>
  );
}

