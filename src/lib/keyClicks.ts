"use client";

const SOURCES = [
  "/audio/keys/keystroke-1.wav",
  "/audio/keys/keystroke-2.wav",
  "/audio/keys/keystroke-3.wav",
  "/audio/keys/keystroke-4.wav",
  "/audio/keys/keystroke-5.wav",
  "/audio/keys/keystroke-6.wav",
];

let ctx: AudioContext | null = null;
let buffers: AudioBuffer[] | null = null;
let loadPromise: Promise<AudioBuffer[]> | null = null;

function getContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function loadBuffers(): Promise<AudioBuffer[]> {
  if (loadPromise) return loadPromise;
  const audioCtx = getContext();
  loadPromise = Promise.all(
    SOURCES.map((src) =>
      fetch(src)
        .then((res) => res.arrayBuffer())
        .then((data) => audioCtx.decodeAudioData(data))
    )
  ).then((decoded) => {
    buffers = decoded;
    return decoded;
  });
  return loadPromise;
}

/** Call on a user gesture (e.g. opening the terminal) to unlock audio and start decoding. */
export function primeKeyClicks() {
  loadBuffers().catch(() => {});
}

/** Plays a random keystroke click. No-op if the buffers haven't finished loading yet. */
export function playKeyClick() {
  if (!buffers || buffers.length === 0) return;
  const audioCtx = getContext();
  const buffer = buffers[Math.floor(Math.random() * buffers.length)];
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.4;
  source.connect(gain).connect(audioCtx.destination);
  source.start(0);
}
