"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import TerminalClock from "@/components/TerminalClock";

const links = [
  { href: "/", label: "home" },
  { href: "/music", label: "music" },
  { href: "/video", label: "video" },
  { href: "/resume", label: "resume" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-(--border-color) bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-1 text-[10px] tracking-widest text-foreground/40">
        <span>
          <TerminalClock />
        </span>
        <span className="hidden sm:inline">SYSTEM.ONLINE</span>
      </div>
      <nav className="mx-auto flex max-w-5xl items-center justify-between border-t border-(--border-color) px-6 py-4">
        <Link
          href="/"
          className="font-display text-sm tracking-widest text-foreground sm:text-base"
          onClick={() => setOpen(false)}
        >
          KYLE_BARTZ
        </Link>

        <div className="hidden items-center gap-5 sm:flex">
          <ul className="flex gap-5 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`transition hover:text-accent ${
                    pathname === link.href
                      ? "text-accent"
                      : "text-foreground/60"
                  }`}
                >
                  <span className="text-foreground/30">[</span>
                  {link.label}
                  <span className="text-foreground/30">]</span>
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="text-sm text-foreground/60 transition hover:text-accent sm:hidden"
        >
          <span className="text-foreground/30">[</span>
          {open ? "close" : "menu"}
          <span className="text-foreground/30">]</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-(--border-color) px-6 py-4 sm:hidden">
          <ul className="flex flex-col gap-4 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`transition hover:text-accent ${
                    pathname === link.href
                      ? "text-accent"
                      : "text-foreground/60"
                  }`}
                >
                  <span className="text-foreground/30">[</span>
                  {link.label}
                  <span className="text-foreground/30">]</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
