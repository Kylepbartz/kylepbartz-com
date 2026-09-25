"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const commands: Record<string, { label: string; cmd: string }> = {
  "/": { label: "/home", cmd: "cd ~ && ./boot.sh" },
  "/music": { label: "/music", cmd: "cd ~/music && ./play.sh" },
  "/video": { label: "/video", cmd: "cd ~/video && ./render.sh" },
  "/resume": { label: "/resume", cmd: "cat resume.pdf" },
};

const TYPE_MS = 22;
const HOLD_MS = 320;

export default function PageTransition() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const [active, setActive] = useState(false);
  const [typed, setTyped] = useState("");
  const target = commands[pathname] ?? {
    label: pathname,
    cmd: `cd ${pathname}`,
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to a route change (an external event), not a mount-time computation
    setActive(true);
    setTyped("");

    let i = 0;
    const typeId = setInterval(() => {
      i += 1;
      setTyped(target.cmd.slice(0, i));
      if (i >= target.cmd.length) clearInterval(typeId);
    }, TYPE_MS);

    const hideId = setTimeout(
      () => setActive(false),
      target.cmd.length * TYPE_MS + HOLD_MS
    );

    return () => {
      clearInterval(typeId);
      clearTimeout(hideId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on route change, `target` is derived from pathname each render
  }, [pathname]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center gap-2 bg-background"
      onClick={() => setActive(false)}
    >
      <p className="text-xs tracking-widest text-foreground/40">
        &gt; loading {target.label}...
      </p>
      <p className="font-mono text-sm text-foreground">
        <span className="text-accent">$</span> {typed}
        <span className="animate-blink">_</span>
      </p>
    </div>
  );
}
