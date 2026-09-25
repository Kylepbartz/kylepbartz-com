import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <section className="flex min-h-[70vh] flex-col-reverse items-center gap-10 py-24 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-6">
          <p className="text-sm font-medium uppercase tracking-widest text-foreground/50">
            Hi, I&apos;m
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Kyle Bartz
          </h1>
          <p className="max-w-xl text-lg text-foreground/70">
            Instructional designer and audio engineer with a passion for
            connecting people and ideas. Since I was a kid in Milwaukee
            I&apos;ve loved music and recording — this is where I keep my
            design work, music, and video projects in one place.
          </p>
          <div className="flex gap-4 pt-2">
            <Link
              href="/music"
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
            >
              Listen to my music
            </Link>
            <Link
              href="/photos"
              className="rounded-full border border-foreground/20 px-5 py-2.5 text-sm font-medium transition hover:border-foreground/40"
            >
              See my photos
            </Link>
          </div>
        </div>
        <Image
          src="/images/kyle-portrait.jpg"
          alt="Portrait of Kyle Bartz"
          width={320}
          height={368}
          priority
          className="w-48 shrink-0 rounded-2xl object-cover sm:w-64"
        />
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/music"
          className="group rounded-2xl border border-black/10 p-6 transition hover:border-foreground/30 dark:border-white/10"
        >
          <h2 className="text-lg font-semibold">Music</h2>
          <p className="mt-2 text-sm text-foreground/60">
            Tracks, playlists, and projects I&apos;ve worked on.
          </p>
        </Link>
        <Link
          href="/photos"
          className="group rounded-2xl border border-black/10 p-6 transition hover:border-foreground/30 dark:border-white/10"
        >
          <h2 className="text-lg font-semibold">Photos</h2>
          <p className="mt-2 text-sm text-foreground/60">
            A selection of photography from recent years.
          </p>
        </Link>
        <Link
          href="/video"
          className="group rounded-2xl border border-black/10 p-6 transition hover:border-foreground/30 dark:border-white/10"
        >
          <h2 className="text-lg font-semibold">Video</h2>
          <p className="mt-2 text-sm text-foreground/60">
            Animated training and demo videos.
          </p>
        </Link>
        <Link
          href="/resume"
          className="group rounded-2xl border border-black/10 p-6 transition hover:border-foreground/30 dark:border-white/10"
        >
          <h2 className="text-lg font-semibold">Resume</h2>
          <p className="mt-2 text-sm text-foreground/60">
            My experience, skills, and background.
          </p>
        </Link>
      </section>
    </div>
  );
}
