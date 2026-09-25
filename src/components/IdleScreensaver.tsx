"use client";

import { useEffect, useRef, useState } from "react";

const IDLE_MS = 60000;
const COLORS = ["#39ff88", "#c792ea", "#82aaff", "#e2b370"];

export default function IdleScreensaver() {
  const [active, setActive] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 80, y: 80, dx: 2.4, dy: 1.8 });
  const rafRef = useRef<number | null>(null);
  const colorIndexRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    function arm() {
      clearTimeout(timer);
      timer = setTimeout(() => setActive(true), IDLE_MS);
    }

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((e) => window.addEventListener(e, arm));
    arm();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, arm));
    };
  }, []);

  useEffect(() => {
    if (!active) return;

    function dismiss() {
      setActive(false);
    }
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "touchstart",
    ];
    events.forEach((e) => window.addEventListener(e, dismiss));
    return () => events.forEach((e) => window.removeEventListener(e, dismiss));
  }, [active]);

  useEffect(() => {
    if (!active) return;

    function tick() {
      const el = boxRef.current;
      if (!el) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const pos = posRef.current;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      pos.x += pos.dx;
      pos.y += pos.dy;

      let bounced = false;
      if (pos.x <= 0 || pos.x + w >= window.innerWidth) {
        pos.dx *= -1;
        pos.x = Math.max(0, Math.min(pos.x, window.innerWidth - w));
        bounced = true;
      }
      if (pos.y <= 0 || pos.y + h >= window.innerHeight) {
        pos.dy *= -1;
        pos.y = Math.max(0, Math.min(pos.y, window.innerHeight - h));
        bounced = true;
      }
      if (bounced) {
        colorIndexRef.current = (colorIndexRef.current + 1) % COLORS.length;
        const color = COLORS[colorIndexRef.current];
        el.style.color = color;
        el.style.borderColor = color;
      }
      el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[80] cursor-none overflow-hidden bg-black">
      <div
        ref={boxRef}
        className="font-display absolute select-none rounded-sm border-2 px-4 py-2 text-sm tracking-widest"
        style={{ color: COLORS[0], borderColor: COLORS[0] }}
      >
        KYLE_BARTZ.EXE
      </div>
    </div>
  );
}
