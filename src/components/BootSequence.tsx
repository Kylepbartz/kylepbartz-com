"use client";

import { useEffect, useState } from "react";

const LINES = [
  "KYLEPBARTZ.OS v1.0.2",
  "Initializing kernel...",
  "Loading modules: music, video, resume...",
  "Mounting /portfolio...",
  "Establishing connection...",
  "READY_",
];

const LINE_MS = 220;
const HOLD_MS = 500;

export default function BootSequence() {
  const [active, setActive] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    // Don't mark "booted" until the sequence actually completes (below).
    // Writing it here would make React Strict Mode's dev-only double-invoke
    // (mount -> cleanup -> mount) skip the second, lasting mount, since it
    // would see the flag already set by the first, cleaned-up one.
    if (sessionStorage.getItem("booted")) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem("booted", "1");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time first-visit boot sequence, gated by sessionStorage so it never re-fires
    setActive(true);

    let i = 0;
    const lineId = setInterval(() => {
      i += 1;
      setVisibleLines(i);
      if (i >= LINES.length) clearInterval(lineId);
    }, LINE_MS);

    const hideId = setTimeout(() => {
      setActive(false);
      sessionStorage.setItem("booted", "1");
    }, LINES.length * LINE_MS + HOLD_MS);

    return () => {
      clearInterval(lineId);
      clearTimeout(hideId);
    };
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-center gap-1 bg-black px-8 font-mono text-sm text-[#39ff88] sm:px-16 sm:text-base">
      {LINES.slice(0, visibleLines).map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}
