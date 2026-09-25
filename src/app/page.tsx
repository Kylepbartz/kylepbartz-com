import Image from "next/image";
import Link from "next/link";
import TerminalWindow from "@/components/TerminalWindow";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <section className="flex flex-col items-center gap-8 py-20 text-center">
        <div className="animate-fade-up overflow-hidden rounded-sm border-2 border-foreground">
          <Image
            src="/images/kyle-portrait.webp"
            alt="Portrait of Kyle Bartz"
            width={200}
            height={200}
            priority
            className="w-32 shrink-0 object-cover grayscale contrast-125 sm:w-40"
          />
        </div>

        <div
          className="animate-fade-up rounded-sm border-2 border-foreground px-6 py-3 sm:px-10 sm:py-4"
          style={{ animationDelay: "80ms" }}
        >
          <h1 className="font-display text-xl tracking-[0.15em] sm:text-3xl">
            KYLE_PATRICK_BARTZ
          </h1>
        </div>

        <p
          className="animate-fade-up text-[11px] tracking-[0.3em] text-foreground/50 uppercase sm:text-xs"
          style={{ animationDelay: "150ms" }}
        >
          instructional.designer / audio.engineer / video.editor
        </p>

        <p
          className="animate-fade-up max-w-xl text-sm text-foreground/70 sm:text-base"
          style={{ animationDelay: "220ms" }}
        >
          Since I was a kid in Milwaukee I&apos;ve loved music and recording.
          This is where I keep my design work, music, and video projects in
          one place.
          <span className="animate-blink text-accent">_</span>
        </p>

        <div
          className="animate-fade-up flex flex-wrap justify-center gap-4 pt-2"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            href="/music"
            className="border border-foreground px-5 py-2.5 text-sm transition hover:border-accent hover:text-accent"
          >
            <span className="text-accent">&gt;</span> RUN music.exe
          </Link>
          <Link
            href="/video"
            className="border border-foreground px-5 py-2.5 text-sm transition hover:border-accent hover:text-accent"
          >
            <span className="text-accent">&gt;</span> RUN video.exe
          </Link>
        </div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-3">
        <Link
          href="/music"
          className="group animate-fade-up transition hover:-translate-y-0.5"
          style={{ animationDelay: "380ms" }}
        >
          <TerminalWindow title="music.exe">
            <h2 className="font-display text-sm tracking-widest">MUSIC</h2>
            <p className="mt-2 text-sm text-foreground/60">
              Tracks, playlists, and projects I&apos;ve worked on.
            </p>
          </TerminalWindow>
        </Link>
        <Link
          href="/video"
          className="group animate-fade-up transition hover:-translate-y-0.5"
          style={{ animationDelay: "440ms" }}
        >
          <TerminalWindow title="video.exe">
            <h2 className="font-display text-sm tracking-widest">VIDEO</h2>
            <p className="mt-2 text-sm text-foreground/60">
              Animated training and demo videos.
            </p>
          </TerminalWindow>
        </Link>
        <Link
          href="/resume"
          className="group animate-fade-up transition hover:-translate-y-0.5"
          style={{ animationDelay: "500ms" }}
        >
          <TerminalWindow title="resume.exe">
            <h2 className="font-display text-sm tracking-widest">RESUME</h2>
            <p className="mt-2 text-sm text-foreground/60">
              My experience, skills, and background.
            </p>
          </TerminalWindow>
        </Link>
      </section>
    </div>
  );
}
