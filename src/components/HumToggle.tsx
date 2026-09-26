"use client";

import { useEffect, useRef, useState } from "react";
import {
  BOOT_COMPLETE_EVENT,
  type BootCompleteDetail,
} from "@/components/BootSequence";
import { getSiteAudioContext, loadAudioBuffer } from "@/lib/siteAudio";

const HUM_SRC = "/audio/hum.wav";
const HUM_VOLUME = 0.1;
// How far ahead of the audio clock each next chunk is queued. Scheduling
// against ctx.currentTime (not JS timers) is what keeps the loop gapless --
// AudioBufferSourceNode.loop has an audible restart glitch in some browsers
// even with a perfectly seamless source file, so we chain sources manually.
const SCHEDULE_AHEAD_SEC = 0.25;

const RESUME_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

export default function HumToggle() {
  const [on, setOn] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const schedulerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextStartRef = useRef(0);
  const playingRef = useRef(false);
  const resumeCleanupRef = useRef<(() => void) | null>(null);
  const bootDoneRef = useRef(false);

  function scheduleNext() {
    const ctx = contextRef.current;
    const buffer = bufferRef.current;
    const gain = gainRef.current;
    if (!ctx || !buffer || !gain || !playingRef.current) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.start(nextStartRef.current);
    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter(
        (s) => s !== source
      );
    };

    nextStartRef.current += buffer.duration;
    const delayMs = Math.max(
      0,
      (nextStartRef.current - ctx.currentTime - SCHEDULE_AHEAD_SEC) * 1000
    );
    schedulerIdRef.current = setTimeout(scheduleNext, delayMs);
  }

  function stopPlayback() {
    playingRef.current = false;
    if (schedulerIdRef.current !== null) {
      clearTimeout(schedulerIdRef.current);
      schedulerIdRef.current = null;
    }
    for (const source of activeSourcesRef.current) {
      source.onended = null;
      source.stop();
    }
    activeSourcesRef.current = [];
  }

  function startPlayback(startAt?: number) {
    const ctx = contextRef.current;
    const buffer = bufferRef.current;
    if (!ctx || !buffer || playingRef.current) return;

    if (!gainRef.current) {
      const gain = ctx.createGain();
      gain.gain.value = HUM_VOLUME;
      gain.connect(ctx.destination);
      gainRef.current = gain;
    }

    playingRef.current = true;
    // A precise startAt (the boot sound's exact end time on this same audio
    // clock) gives a sample-accurate handoff; otherwise start almost
    // immediately.
    nextStartRef.current = startAt ?? ctx.currentTime + 0.05;
    scheduleNext();
    setOn(true);
  }

  function maybeStart(startAt?: number) {
    if (bootDoneRef.current) startPlayback(startAt);
  }

  useEffect(() => {
    if (sessionStorage.getItem("booted")) bootDoneRef.current = true;

    function onBootComplete(e: Event) {
      bootDoneRef.current = true;
      maybeStart((e as CustomEvent<BootCompleteDetail>).detail?.at);
    }
    window.addEventListener(BOOT_COMPLETE_EVENT, onBootComplete);

    let cancelled = false;
    const ctx = getSiteAudioContext();
    contextRef.current = ctx;
    loadAudioBuffer(ctx, HUM_SRC)
      .then((buffer) => {
        if (cancelled) return;
        bufferRef.current = buffer;
        // Ambient hum defaults to on, but only once the boot sequence has
        // finished and the home page is showing (see maybeStart/bootDoneRef).
        // Browsers still block audio until a genuine user gesture, so we
        // resume the context on the very first interaction -- in practice,
        // usually the same click that launches the boot sequence -- so
        // playback is unlocked and ready the moment boot completes.
        maybeStart();
        if (ctx.state === "suspended") {
          const resume = () => {
            ctx.resume().catch(() => {});
          };
          for (const evt of RESUME_EVENTS) {
            window.addEventListener(evt, resume, { once: true });
          }
          resumeCleanupRef.current = () => {
            for (const evt of RESUME_EVENTS) {
              window.removeEventListener(evt, resume);
            }
          };
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      window.removeEventListener(BOOT_COMPLETE_EVENT, onBootComplete);
      stopPlayback();
      resumeCleanupRef.current?.();
      // Don't close the AudioContext here -- it's shared with BootSequence.
      contextRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time setup; startPlayback/maybeStart read refs, not state
  }, []);

  function toggle() {
    const ctx = contextRef.current;
    if (!ctx) return;

    if (playingRef.current) {
      stopPlayback();
      setOn(false);
      return;
    }

    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    startPlayback();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "Mute ambient hum" : "Play ambient hum"}
      aria-pressed={on}
      className={`flex h-6 w-6 items-center justify-center rounded-sm border border-(--border-color) transition-colors ${
        on ? "text-accent" : "text-foreground/50 hover:text-accent"
      }`}
    >
      {on ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-[15px] w-[15px]"
        >
          <path d="M11 4.7v14.6c0 .8-.97 1.2-1.54.63L5 15H2.5A1.5 1.5 0 011 13.5v-3A1.5 1.5 0 012.5 9H5l4.46-4.93C10.03 3.5 11 3.9 11 4.7z" />
          <path d="M15.5 8.5a5 5 0 010 7 1 1 0 11-1.4-1.42 3 3 0 000-4.16 1 1 0 011.4-1.42z" />
          <path d="M17.8 5.9a1 1 0 011.4 0 9 9 0 010 12.2 1 1 0 11-1.42-1.4 7 7 0 000-9.4 1 1 0 01.02-1.4z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-[15px] w-[15px]"
        >
          <path d="M11 4.7v14.6c0 .8-.97 1.2-1.54.63L5 15H2.5A1.5 1.5 0 011 13.5v-3A1.5 1.5 0 012.5 9H5l4.46-4.93C10.03 3.5 11 3.9 11 4.7z" />
          <path d="M15.2 9.2a1 1 0 011.42 0L18 10.59l1.38-1.39a1 1 0 111.42 1.42L19.41 12l1.39 1.38a1 1 0 01-1.42 1.42L18 13.41l-1.38 1.39a1 1 0 01-1.42-1.42L16.59 12l-1.39-1.38a1 1 0 010-1.42z" />
        </svg>
      )}
    </button>
  );
}
