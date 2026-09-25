"use client";

import { useEffect, useState } from "react";

function format(date: Date) {
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${datePart} ${timePart}`;
}

export default function TerminalClock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first client-only read of the clock; server can't know the viewer's local time
    setNow(format(new Date()));
    const id = setInterval(() => setNow(format(new Date())), 1000 * 15);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {now ?? "--/--/---- --:--"}
    </span>
  );
}
