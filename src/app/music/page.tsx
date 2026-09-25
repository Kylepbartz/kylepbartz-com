import type { Metadata } from "next";
import { tracks, soundcloudProfileUrl } from "@/data/tracks";

export const metadata: Metadata = {
  title: "Music — Kyle Bartz",
};

export default function MusicPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Music</h1>
      <p className="mt-3 text-foreground/70">
        A collection of tracks I&apos;ve written, produced, or performed.
        More on{" "}
        <a
          href={soundcloudProfileUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4"
        >
          SoundCloud
        </a>
        .
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

            {track.soundcloudTrackId ? (
              <iframe
                title={track.title}
                className="mt-4 w-full"
                height="166"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${track.soundcloudTrackId}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
              />
            ) : track.audioSrc ? (
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
                Listen on SoundCloud
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
