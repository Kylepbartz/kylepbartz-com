import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <section className="flex min-h-[70vh] flex-col justify-center gap-6 py-24">
        <p className="text-sm font-medium uppercase tracking-widest text-foreground/50">
          Hi, I&apos;m
        </p>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Kyle Bartz
        </h1>
        <p className="max-w-xl text-lg text-foreground/70">
          Instructional designer with a passion for connecting people and
          ideas. I also make music, take photos, and build things — this is
          where I keep it all in one place.
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
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-3">
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
