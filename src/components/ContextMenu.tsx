"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ContextMenu() {
  const router = useRouter();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function onContextMenu(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (isTyping) return;

      e.preventDefault();
      setPos({ x: e.clientX, y: e.clientY });
    }
    function close() {
      setPos(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    window.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!pos) return null;

  const items = [
    { label: "reload.exe", action: () => window.location.reload() },
    { label: "home.exe", action: () => router.push("/") },
    {
      label: "open_terminal.exe",
      action: () => window.dispatchEvent(new Event("open-terminal")),
    },
  ];

  const menuWidth = 190;
  const menuHeight = items.length * 30 + 10;
  const x = Math.min(pos.x, window.innerWidth - menuWidth - 8);
  const y = Math.min(pos.y, window.innerHeight - menuHeight - 8);

  return (
    <div
      role="menu"
      className="fixed z-[90] w-[190px] rounded-sm border border-(--border-color) bg-background py-1 text-sm shadow-lg"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          onClick={() => {
            item.action();
            setPos(null);
          }}
          className="block w-full px-3 py-1.5 text-left transition hover:bg-foreground/5 hover:text-accent"
        >
          <span className="text-foreground/30">[</span>
          {item.label}
          <span className="text-foreground/30">]</span>
        </button>
      ))}
    </div>
  );
}
