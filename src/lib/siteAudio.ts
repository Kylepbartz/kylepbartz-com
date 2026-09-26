"use client";

// Shared AudioContext for the boot sequence and ambient hum. Both need to be
// scheduled against the same audio clock so the hum's first sample can start
// at the exact instant the boot sound ends, with no gap between them.
let ctx: AudioContext | null = null;
const bufferCache = new Map<string, Promise<AudioBuffer>>();

export function getSiteAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function loadAudioBuffer(
  audioCtx: AudioContext,
  src: string
): Promise<AudioBuffer> {
  let promise = bufferCache.get(src);
  if (!promise) {
    promise = fetch(src)
      .then((res) => res.arrayBuffer())
      .then((data) => audioCtx.decodeAudioData(data));
    bufferCache.set(src, promise);
  }
  return promise;
}
