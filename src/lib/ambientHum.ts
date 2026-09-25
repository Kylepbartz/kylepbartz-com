"use client";

const SRC = "/audio/hum.wav";
const TARGET_GAIN = 0.12;
const RAMP_SECONDS = 0.3;

let ctx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loadPromise: Promise<AudioBuffer> | null = null;
let source: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;
let muted = false;

function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function loadBuffer(): Promise<AudioBuffer> {
  if (loadPromise) return loadPromise;
  const audioCtx = getContext();
  loadPromise = fetch(SRC)
    .then((res) => res.arrayBuffer())
    .then((data) => audioCtx.decodeAudioData(data))
    .then((decoded) => {
      buffer = decoded;
      return decoded;
    });
  return loadPromise;
}

/** Reads the persisted mute preference (defaults to unmuted) and returns it. */
export function initHumMutePreference(): boolean {
  try {
    muted = localStorage.getItem("hum-muted") === "1";
  } catch {
    muted = false;
  }
  return muted;
}

export function isHumMuted() {
  return muted;
}

/** Starts the looping hum. Safe to call multiple times; only ever starts one instance. */
export async function startHum() {
  if (source) return;
  const buf = buffer ?? (await loadBuffer().catch(() => null));
  if (!buf || source) return;

  const audioCtx = getContext();
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  src.loop = true;

  const gain = audioCtx.createGain();
  gain.gain.value = muted ? 0 : TARGET_GAIN;

  src.connect(gain).connect(audioCtx.destination);
  src.start(0);

  source = src;
  gainNode = gain;
}

export function setHumMuted(next: boolean) {
  muted = next;
  try {
    localStorage.setItem("hum-muted", next ? "1" : "0");
  } catch {
    // ignore
  }

  if (gainNode) {
    const audioCtx = getContext();
    gainNode.gain.linearRampToValueAtTime(
      next ? 0 : TARGET_GAIN,
      audioCtx.currentTime + RAMP_SECONDS
    );
  }

  // Unmuting is a user gesture (the toggle click), so if autoplay was
  // blocked earlier, this is a reliable place to actually start playback.
  if (!next && !source) {
    startHum();
  }
}

export function suspendHum() {
  ctx?.suspend();
}

export function resumeHum() {
  if (!muted) ctx?.resume();
}
