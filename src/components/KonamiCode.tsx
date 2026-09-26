"use client";

import { useEffect, useRef } from "react";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** Shared by the real key sequence and the hidden "andromeda" terminal
 * command so both trigger the exact same game-launch effect. */
export function triggerKonami() {
  window.dispatchEvent(new Event("konami-code"));
}

export default function KonamiCode() {
  const progress = useRef(0);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const expected = SEQUENCE[progress.current];
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key === expected) {
        progress.current += 1;
        if (progress.current === SEQUENCE.length) {
          progress.current = 0;
          // The final keystroke of the sequence is a genuine user gesture,
          // so this is guaranteed to be allowed to play.
          triggerKonami();
        }
      } else {
        progress.current = key === SEQUENCE[0] ? 1 : 0;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
