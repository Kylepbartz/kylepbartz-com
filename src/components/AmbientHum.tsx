"use client";

import { useEffect } from "react";
import {
  startHum,
  initHumMutePreference,
  suspendHum,
  resumeHum,
} from "@/lib/ambientHum";

export default function AmbientHum() {
  useEffect(() => {
    initHumMutePreference();

    function onBootComplete() {
      startHum();
    }

    // If boot already happened earlier this tab session (e.g. a reload),
    // there's no boot-complete event coming, so start right away instead.
    if (sessionStorage.getItem("booted")) {
      startHum();
    } else {
      window.addEventListener("boot-complete", onBootComplete);
    }

    function onVisibility() {
      if (document.hidden) suspendHum();
      else resumeHum();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("boot-complete", onBootComplete);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
