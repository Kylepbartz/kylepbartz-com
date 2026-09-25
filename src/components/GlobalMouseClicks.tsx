"use client";

import { useEffect } from "react";
import { primeMouseClicks, playMouseDown, playMouseUp } from "@/lib/mouseClicks";

export default function GlobalMouseClicks() {
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      primeMouseClicks();
      playMouseDown();
    }
    function onMouseUp(e: MouseEvent) {
      if (e.button !== 0) return;
      playMouseUp();
    }
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return null;
}
