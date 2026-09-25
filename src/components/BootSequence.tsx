"use client";

import { useEffect, useRef, useState } from "react";

const LINES = [
  "KYLEPBARTZ.OS v1.0.2",
  "BIOS check... OK",
  "Initializing kernel...",
  "Mounting filesystem...",
  "Loading modules: music, video, resume...",
  "Checking audio drivers... OK",
  "Checking display drivers... OK",
  "Decompressing assets...",
  "Mounting /portfolio...",
  "Establishing connection...",
  "Verifying integrity... OK",
  "Starting services...",
  "READY_",
];

const LINE_MS = 550;
const HOLD_MS = 400;
const SOUND_SRC = "/audio/boot-sequence.mp3";

type Stage = "idle" | "awaiting-power" | "booting";

export default function BootSequence() {
  const [stage, setStage] = useState<Stage>("idle");
  const [visibleLines, setVisibleLines] = useState(0);
  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (sessionStorage.getItem("booted")) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem("booted", "1");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time first-visit check, gated by sessionStorage so it never re-fires
    setStage("awaiting-power");

    return () => cleanupRef.current();
  }, []);

  function powerOn() {
    setStage("booting");

    // This runs inside the button's click handler, so it's a genuine user
    // gesture -- unlike a boot triggered automatically on page load, this
    // audio is guaranteed to be allowed to play.
    const audio = new Audio(SOUND_SRC);
    audio.volume = 0.5;
    audio.play().catch(() => {});

    let i = 0;
    const lineId = setInterval(() => {
      i += 1;
      setVisibleLines(i);
      if (i >= LINES.length) clearInterval(lineId);
    }, LINE_MS);

    const hideId = setTimeout(() => {
      setStage("idle");
      sessionStorage.setItem("booted", "1");
    }, LINES.length * LINE_MS + HOLD_MS);

    cleanupRef.current = () => {
      clearInterval(lineId);
      clearTimeout(hideId);
      audio.pause();
    };
  }

  if (stage === "idle") return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-black px-8 font-mono text-sm text-[#39ff88] sm:px-16 sm:text-base">
      {stage === "awaiting-power" ? (
        <>
          <p className="text-xs tracking-widest text-white/40 sm:text-sm">
            SYSTEM OFFLINE
          </p>
          <button
            type="button"
            onClick={powerOn}
            className="border border-[#39ff88] px-6 py-3 tracking-widest transition hover:bg-[#39ff88] hover:text-black"
          >
            &gt; POWER ON
          </button>
        </>
      ) : (
        <div className="flex w-full flex-col gap-1 self-start">
          {LINES.slice(0, visibleLines).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}
