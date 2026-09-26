"use client";

import { useEffect, useRef, useState } from "react";
import { geocodeCity, geocodeDisplayName } from "@/lib/geocode";

export const OPEN_WEATHER_EVENT = "toggle-weather";

// Milwaukee, WI. Fixed rather than using the visitor's geolocation, to keep
// this privacy-friendly: it's "this machine's" weather, not a request for
// the visitor's location.
const DEFAULT_LOCATION_NAME = "Milwaukee, WI";
const DEFAULT_LATITUDE = 43.0389;
const DEFAULT_LONGITUDE = -87.9065;

function weatherUrl(lat: number, lon: number) {
  return (
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m" +
    "&temperature_unit=fahrenheit&wind_speed_unit=mph"
  );
}

const WEATHER_CODES: Record<number, string> = {
  0: "clear sky",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "depositing rime fog",
  51: "light drizzle",
  53: "moderate drizzle",
  55: "dense drizzle",
  56: "light freezing drizzle",
  57: "dense freezing drizzle",
  61: "slight rain",
  63: "moderate rain",
  65: "heavy rain",
  66: "light freezing rain",
  67: "heavy freezing rain",
  71: "slight snow",
  73: "moderate snow",
  75: "heavy snow",
  77: "snow grains",
  80: "slight rain showers",
  81: "moderate rain showers",
  82: "violent rain showers",
  85: "slight snow showers",
  86: "heavy snow showers",
  95: "thunderstorm",
  96: "thunderstorm, slight hail",
  99: "thunderstorm, heavy hail",
};

type Current = {
  temperature_2m: number;
  weather_code: number;
  wind_speed_10m: number;
  relative_humidity_2m: number;
};

type Status = "loading" | "ready" | "error" | "not-found";

export default function WeatherWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [current, setCurrent] = useState<Current | null>(null);
  const [locationName, setLocationName] = useState(DEFAULT_LOCATION_NAME);
  const [query, setQuery] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 300, y: 96 });
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
    window.addEventListener(OPEN_WEATHER_EVENT, onToggle);
    return () => window.removeEventListener(OPEN_WEATHER_EVENT, onToggle);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets stale status from a previous open/query before this fetch's result arrives
    setStatus("loading");

    async function run() {
      let lat = DEFAULT_LATITUDE;
      let lon = DEFAULT_LONGITUDE;
      let name = DEFAULT_LOCATION_NAME;

      if (query) {
        const result = await geocodeCity(query);
        if (!result) {
          if (!cancelled) setStatus("not-found");
          return;
        }
        lat = result.latitude;
        lon = result.longitude;
        name = geocodeDisplayName(result);
      }

      const res = await fetch(weatherUrl(lat, lon));
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (cancelled) return;
      setLocationName(name);
      setCurrent(data.current);
      setStatus("ready");
    }

    run().catch(() => {
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
    };
  }, [open, query]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
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
          <span className="text-syntax-string">weather.exe</span>
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="transition hover:text-accent"
          aria-label="Close weather"
        >
          [close]
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 px-4 py-6 text-center">
        <span className="text-xs tracking-widest text-foreground/50">
          {status === "ready" ? locationName : (query ?? DEFAULT_LOCATION_NAME)}
        </span>
        {status === "loading" && (
          <span className="mt-3 text-sm text-foreground/50">
            fetching conditions...
          </span>
        )}
        {status === "error" && (
          <span className="mt-3 text-sm text-foreground/50">
            weather unavailable
          </span>
        )}
        {status === "not-found" && (
          <span className="mt-3 text-sm text-foreground/50">
            location not found
          </span>
        )}
        {status === "ready" && current && (
          <>
            <span className="font-display mt-2 text-3xl tabular-nums tracking-widest text-accent">
              {Math.round(current.temperature_2m)}&deg;F
            </span>
            <span className="text-sm text-foreground/70">
              {WEATHER_CODES[current.weather_code] ?? "unknown conditions"}
            </span>
            <span className="mt-2 text-xs text-foreground/40">
              wind {Math.round(current.wind_speed_10m)} mph &middot; humidity{" "}
              {Math.round(current.relative_humidity_2m)}%
            </span>
          </>
        )}
      </div>
    </div>
  );
}
