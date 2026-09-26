"use client";

import { useEffect, useRef, useState } from "react";

export const OPEN_SYSINFO_EVENT = "toggle-sysinfo";

const BROWSER_PATTERNS: [RegExp, string][] = [
  [/Edg\/([\d.]+)/, "Edge"],
  [/OPR\/([\d.]+)/, "Opera"],
  [/CriOS\/([\d.]+)/, "Chrome iOS"],
  [/FxiOS\/([\d.]+)/, "Firefox iOS"],
  [/Chrome\/([\d.]+)/, "Chrome"],
  [/Firefox\/([\d.]+)/, "Firefox"],
  [/Version\/([\d.]+).*Safari/, "Safari"],
];

function parseBrowser(ua: string): string {
  for (const [re, name] of BROWSER_PATTERNS) {
    const m = ua.match(re);
    if (m) return `${name} ${m[1].split(".")[0]}`;
  }
  return "Unknown";
}

function formatUptime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function readTheme(): string {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored[0].toUpperCase() + stored.slice(1);
  }
  return "System";
}

const STATIC_ROWS: [string, string][] = [
  ["shell", "terminal.exe"],
  ["cpu", "Curiosity @ 3.8GHz"],
  ["gpu", "Imagination RTX"],
  ["memory", "16GB Coffee / 4GB Used"],
  ["disk", "∞ ideas / finite time"],
];

export default function SysInfoWidget() {
  const [open, setOpen] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [resolution, setResolution] = useState("--x--");
  const [theme, setThemeState] = useState("System");
  const [browser, setBrowser] = useState("Unknown");
  const [host, setHost] = useState("");
  const [pos, setPos] = useState({ x: 300, y: 260 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function onToggle() {
      setOpen((o) => !o);
    }
    window.addEventListener(OPEN_SYSINFO_EVENT, onToggle);
    return () => window.removeEventListener(OPEN_SYSINFO_EVENT, onToggle);
  }, []);

  useEffect(() => {
    if (!open) return;

    const start = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first client-only read on open; nothing to sync from the server
    setUptime(0);
    const id = setInterval(
      () => setUptime(Math.floor((Date.now() - start) / 1000)),
      1000
    );

    function updateResolution() {
      setResolution(`${window.innerWidth}x${window.innerHeight}`);
    }
    updateResolution();
    window.addEventListener("resize", updateResolution);

    setThemeState(readTheme());
    setBrowser(parseBrowser(navigator.userAgent));
    setHost(window.location.hostname || "localhost");

    return () => {
      clearInterval(id);
      window.removeEventListener("resize", updateResolution);
    };
  }, [open]);

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

  const rows: [string, string][] = [
    ["os", "KYLEPBARTZ.OS v1.0.2"],
    ["host", host || "localhost"],
    ["uptime", formatUptime(uptime)],
    ["resolution", resolution],
    ["theme", theme],
    ["browser", browser],
    ...STATIC_ROWS,
  ];

  return (
    <div
      ref={widgetRef}
      className="fixed z-[80] w-72 rounded-sm border border-(--border-color) bg-background shadow-xl select-none"
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
          <span className="text-syntax-string">sysinfo.exe</span>
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="transition hover:text-accent"
          aria-label="Close sysinfo"
        >
          [close]
        </button>
      </div>

      <div className="px-4 py-4 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-0.5">
            <span className="text-accent">{label}</span>
            <span className="text-right text-foreground/70">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
