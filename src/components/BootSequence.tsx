"use client";

import { useEffect, useRef, useState } from "react";
import { getSiteAudioContext, loadAudioBuffer } from "@/lib/siteAudio";

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
const SOUND_SRC = "/audio/boot-sequence.wav";

type Stage = "idle" | "awaiting-power" | "booting";

export const BOOT_COMPLETE_EVENT = "site:boot-complete";

/** Detail carried by BOOT_COMPLETE_EVENT: `at` is the getSiteAudioContext()
 * timestamp the boot sound finishes at, so a listener can schedule the next
 * sound to start at that exact instant. Omitted when no boot audio played. */
export type BootCompleteDetail = { at?: number };

export default function BootSequence() {
  const [stage, setStage] = useState<Stage>("idle");
  const [visibleLines, setVisibleLines] = useState(0);
  const cleanupRef = useRef<() => void>(() => {});
  const bufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("booted")) {
      window.dispatchEvent(new CustomEvent(BOOT_COMPLETE_EVENT));
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem("booted", "1");
      window.dispatchEvent(new CustomEvent(BOOT_COMPLETE_EVENT));
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time first-visit check, gated by sessionStorage so it never re-fires
    setStage("awaiting-power");

    // Preload and decode the boot sound now so it can start the instant
    // LAUNCH is pressed, with its exact end time known up front.
    loadAudioBuffer(getSiteAudioContext(), SOUND_SRC)
      .then((buffer) => {
        bufferRef.current = buffer;
      })
      .catch(() => {});

    return () => cleanupRef.current();
  }, []);

  useEffect(() => {
    if (stage !== "awaiting-power") return;
    function onKeyDown() {
      powerOn();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stage]);

  function powerOn() {
    setStage("booting");

    // This runs inside the button's click handler, so it's a genuine user
    // gesture -- unlike a boot triggered automatically on page load, this
    // audio is guaranteed to be allowed to play.
    const ctx = getSiteAudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const buffer = bufferRef.current;
    if (buffer) {
      const gain = ctx.createGain();
      gain.gain.value = 0.1;
      gain.connect(ctx.destination);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);

      const startAt = ctx.currentTime;
      source.start(startAt);
      sourceRef.current = source;

      const endAt = startAt + buffer.duration;
      window.dispatchEvent(
        new CustomEvent<BootCompleteDetail>(BOOT_COMPLETE_EVENT, {
          detail: { at: endAt },
        })
      );
    } else {
      // Buffer wasn't decoded in time (rare) -- fall back to starting
      // whatever comes next immediately rather than blocking on it.
      window.dispatchEvent(new CustomEvent(BOOT_COMPLETE_EVENT));
    }

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
      sourceRef.current?.stop();
      sourceRef.current = null;
    };
  }

  if (stage === "idle") return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-black px-8 font-mono text-sm text-[#39ff88] sm:px-16 sm:text-base">
      {stage === "awaiting-power" ? (
        <>
          <p className="text-xs tracking-widest text-white/40 sm:text-sm">
            SYSTEM READY
          </p>
          <button
            type="button"
            onClick={powerOn}
            className="border border-[#39ff88] px-6 py-3 tracking-widest transition hover:bg-[#39ff88] hover:text-black"
          >
            &gt; LAUNCH
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
