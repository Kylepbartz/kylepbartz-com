import type { Metadata } from "next";
import { tracks } from "@/data/tracks";

export const metadata: Metadata = {
  title: "Music — Your Name",
};

export default function MusicPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Music</h1>
      <p className="mt-3 text-foreground/70">
        A collection of tracks I&apos;ve written, produced, or performed.
      </p>

      <div className="mt-10 flex flex-col gap-4">
        {tracks.map((track) => (
          <div
            key={track.title}
            className="rounded-2xl border border-black/10 p-6 dark:border-white/10"
          >
            <h2 className="text-lg font-semibold">{track.title}</h2>
            <p className="mt-1 text-sm text-foreground/60">
              {track.description}
            </p>

            {track.audioSrc ? (
              <audio controls className="mt-4 w-full">
                <source src={track.audioSrc} />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p className="mt-4 rounded-lg bg-black/5 px-3 py-2 text-xs text-foreground/50 dark:bg-white/5">
                Add an audio file to <code>/public/audio</code> and set{" "}
                <code>audioSrc</code> in <code>src/data/tracks.ts</code> to
                enable playback here.
              </p>
            )}

            {track.externalUrl && (
              <a
                href={track.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
              >
                Listen on external platform
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
