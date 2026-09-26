"use client";

import { useEffect, useRef, useState } from "react";
import { geocodeCity, geocodeDisplayName } from "@/lib/geocode";

export const OPEN_CLOCK_EVENT = "toggle-clock";

type Status = "ready" | "loading" | "error" | "not-found";

function formatTime(date: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone,
  }).format(date);
}

function formatDate(date: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone,
  }).format(date);
}

export default function ClockWidget() {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [locationName, setLocationName] = useState<string | null>(null);
  const [timeZone, setTimeZone] = useState<string | undefined>(undefined);
  const [pos, setPos] = useState({ x: 24, y: 96 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function onToggle(e: Event) {
      const detail = (e as CustomEvent<{ query?: string }>).detail;
      if (detail?.query) {
        setQuery(detail.query);
        setOpen(true);
      } else {
        setOpen((o) => !o);
      }
    }
    window.addEventListener(OPEN_CLOCK_EVENT, onToggle);
    return () => window.removeEventListener(OPEN_CLOCK_EVENT, onToggle);
  }, []);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first client-only read of the clock on open; server can't know the viewer's local time
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clears a previous city lookup's state when reverting to the local clock
      setStatus("ready");
      setLocationName(null);
      setTimeZone(undefined);
      return;
    }
    let cancelled = false;
    setStatus("loading");
    geocodeCity(query)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setStatus("not-found");
          return;
        }
        setLocationName(geocodeDisplayName(result));
        setTimeZone(result.timezone);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [open, query]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Don't start a drag (and don't capture the pointer) when the press
    // starts on the close button -- pointer capture on the header would
    // otherwise retarget the resulting click away from the button.
    if ((e.target as HTMLElement).closest("button")) return;
    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setPos({
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  if (!open) return null;

  return (
    <div
      ref={widgetRef}
      className="fixed z-[80] w-64 rounded-sm border border-(--border-color) bg-background shadow-xl select-none"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="flex cursor-move items-center justify-between border-b border-(--border-color) px-4 py-2 text-[10px] tracking-widest text-foreground/40"
      >
        <span className="flex items-center gap-2">
          <span className="flex gap-1">
            <span className="h-2 w-2 rounded-full border border-(--border-color)" />
            <span className="h-2 w-2 rounded-full border border-(--border-color)" />
            <span className="h-2 w-2 rounded-full border border-(--border-color)" />
          </span>
          <span className="text-syntax-string">clock.exe</span>
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="transition hover:text-accent"
          aria-label="Close clock"
        >
          [close]
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 px-4 py-6">
        {query && (
          <span className="text-xs tracking-widest text-foreground/50">
            {status === "ready" ? (locationName ?? query) : query}
          </span>
        )}
        {status === "loading" && (
          <span className="mt-3 text-sm text-foreground/50">
            looking up {query}...
          </span>
        )}
        {status === "error" && (
          <span className="mt-3 text-sm text-foreground/50">
            lookup failed
          </span>
        )}
        {status === "not-found" && (
          <span className="mt-3 text-sm text-foreground/50">
            location not found
          </span>
        )}
        {status === "ready" && (
          <>
            <span
              className="font-display text-2xl tabular-nums tracking-widest text-accent"
              suppressHydrationWarning
            >
              {now ? formatTime(now, timeZone) : "--:--:-- --"}
            </span>
            <span
              className="text-xs tracking-widest text-foreground/50"
              suppressHydrationWarning
            >
              {now ? formatDate(now, timeZone) : "---, --- -- ----"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
