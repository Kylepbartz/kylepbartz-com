"use client";

import { useEffect, type RefObject } from "react";

// Frame order and per-frame durations (ms) extracted from the original
// Busy.ani's "seq " and "rate" chunks -- CSS can't animate .cur/.ani
// cursors on its own, so this replays them manually.
const SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 0];
const DURATIONS_MS = [117, 117, 117, 117, 117, 250, 67, 67, 67, 67];

function busyFrameUrls(dark: boolean) {
  // Dark backgrounds need the light-colored (white-on-black) cursor set to
  // stay visible -- opposite of the folder name, matching the fill color.
  const folder = dark ? "light" : "dark";
  return Array.from(
    { length: 9 },
    (_, i) => `url(/cursors/${folder}/busy-${i}.cur), progress`
  );
}

function isDarkTheme(): boolean {
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Shows the animated hourglass "busy" cursor for as long as `active` is
 * true, on `targetRef`'s element if given (read at effect-run time, so the
 * ref can be attached to an element that only exists while active) or on
 * <body> otherwise. `forceDark` skips the site-theme check, for callers
 * whose background is a fixed color regardless of the site's theme. */
export function useBusyCursor(
  active: boolean,
  targetRef?: RefObject<HTMLElement | null>,
  forceDark?: boolean
) {
  useEffect(() => {
    if (!active) return;
    const el = targetRef?.current ?? document.body;

    const frames = busyFrameUrls(forceDark ?? isDarkTheme());
    let step = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    function tick() {
      el.style.cursor = frames[SEQUENCE[step % SEQUENCE.length]];
      const delay = DURATIONS_MS[step % DURATIONS_MS.length];
      step += 1;
      timeoutId = setTimeout(tick, delay);
    }
    tick();

    return () => {
      clearTimeout(timeoutId);
      el.style.cursor = "";
    };
  }, [active, targetRef, forceDark]);
}
