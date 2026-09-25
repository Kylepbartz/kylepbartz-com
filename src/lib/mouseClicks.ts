"use client";

const PRESS_SRC = "/audio/mouse/press.wav";
const RELEASE_SRC = "/audio/mouse/release.wav";

let ctx: AudioContext | null = null;
let pressBuffer: AudioBuffer | null = null;
let releaseBuffer: AudioBuffer | null = null;
let loadPromise: Promise<void> | null = null;

function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function loadBuffers(): Promise<void> {
  if (loadPromise) return loadPromise;
  const audioCtx = getContext();
  const decode = (src: string) =>
    fetch(src)
      .then((res) => res.arrayBuffer())
      .then((data) => audioCtx.decodeAudioData(data));

  loadPromise = Promise.all([decode(PRESS_SRC), decode(RELEASE_SRC)]).then(
    ([press, release]) => {
      pressBuffer = press;
      releaseBuffer = release;
    }
  );
  return loadPromise;
}

/** Call on a user gesture (e.g. the first mousedown) to unlock audio and start decoding. */
export function primeMouseClicks() {
  loadBuffers().catch(() => {});
}

function play(buffer: AudioBuffer | null) {
  if (!buffer) return;
  const audioCtx = getContext();
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.1;
  source.connect(gain).connect(audioCtx.destination);
  source.start(0);
}

export function playMouseDown() {
  play(pressBuffer);
}

export function playMouseUp() {
  play(releaseBuffer);
}
