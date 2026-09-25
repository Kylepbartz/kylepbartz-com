"use client";

import { useEffect } from "react";
import { primeKeyClicks, playKeyClick } from "@/lib/keyClicks";

const NON_CLICK_KEYS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock"]);

export default function GlobalKeyClicks() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (NON_CLICK_KEYS.has(e.key)) return;
      primeKeyClicks();
      playKeyClick();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
