import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import TerminalClock from "@/components/TerminalClock";

const links = [
  { href: "/", label: "home" },
  { href: "/music", label: "music" },
  { href: "/video", label: "video" },
  { href: "/resume", label: "resume" },
];

export default function Nav() {
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
        >
          KYLE_BARTZ
        </Link>
        <div className="flex items-center gap-5">
          <ul className="flex gap-5 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-foreground/60 transition hover:text-accent"
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
      </nav>
    </header>
  );
}
