import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/music", label: "Music" },
  { href: "/video", label: "Video" },
  { href: "/resume", label: "Resume" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Kyle Bartz
        </Link>
        <ul className="flex gap-6 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-foreground/70 transition hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
