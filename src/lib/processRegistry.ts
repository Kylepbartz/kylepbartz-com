"use client";

import { useEffect } from "react";

export type ProcessName = "clock.exe" | "weather.exe" | "sysinfo.exe";

const PROCESS_ORDER: ProcessName[] = ["clock.exe", "weather.exe", "sysinfo.exe"];

const running = new Map<ProcessName, boolean>();

/** Call from a widget with its own `open` state so `ps`/`kill` in the
 * terminal can see and control it. */
export function useProcessRegistration(name: ProcessName, open: boolean) {
  useEffect(() => {
    running.set(name, open);
    return () => {
      running.set(name, false);
    };
  }, [name, open]);
}

export function listRunningProcesses(): ProcessName[] {
  return PROCESS_ORDER.filter((name) => running.get(name));
}

export function isProcessRunning(name: ProcessName): boolean {
  return running.get(name) === true;
}
