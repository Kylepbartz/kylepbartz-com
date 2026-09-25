"use client";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-(--border-color)">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-8 text-xs text-foreground/50 sm:flex-row sm:justify-between">
        <p className="tracking-wide">
          <span className="text-accent">&gt;</span> EOF. &copy;{" "}
          {new Date().getFullYear()} KYLE_BARTZ
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new Event("open-terminal"))
            }
            className="transition hover:text-accent"
          >
            [terminal]
          </button>
          <a
            href="mailto:kyle@kylepbartz.com"
            className="transition hover:text-accent"
          >
            [email]
          </a>
          <a href="tel:+14145819732" className="transition hover:text-accent">
            [phone]
          </a>
          <a
            href="https://www.linkedin.com/in/kyle-bartz-277b8731"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-accent"
          >
            [linkedin]
          </a>
          <a
            href="https://soundcloud.com/kyle-bartz-866526878"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-accent"
          >
            [soundcloud]
          </a>
        </div>
      </div>
      <p className="pb-4 text-center text-[10px] tracking-widest text-foreground/30">
        press <span className="text-accent">/</span> to open a terminal
      </p>
    </footer>
  );
}
