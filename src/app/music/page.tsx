import type { Metadata } from "next";
import { tracks, soundcloudProfileUrl } from "@/data/tracks";
import PageHeader from "@/components/PageHeader";
import TerminalWindow from "@/components/TerminalWindow";

export const metadata: Metadata = {
  title: "Music - Kyle Bartz",
};

export default function MusicPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        process="audio_test.exe"
        title="MUSIC"
        subtitle={
          <>
            A collection of tracks I&apos;ve written, produced, or performed.
            More on{" "}
            <a
              href={soundcloudProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-4"
            >
              SoundCloud
            </a>
            .
          </>
        }
      />

      <div className="flex flex-col gap-6">
        {tracks.map((track, i) => (
          <div
            key={track.title}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <TerminalWindow
              title={`${track.title.toLowerCase().replace(/\s+/g, "_")}.mp3`}
            >
              <h2 className="font-display text-sm tracking-widest">
                {track.title.toUpperCase()}
              </h2>
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
                  src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${track.soundcloudTrackId}&color=%2339ff88&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
                />
              ) : track.audioSrc ? (
                <audio controls className="mt-4 w-full">
                  <source src={track.audioSrc} />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <p className="mt-4 border border-(--border-color) px-3 py-2 text-xs text-foreground/50">
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
                  className="mt-3 inline-block text-sm text-accent underline underline-offset-4"
                >
                  Listen on SoundCloud
                </a>
              )}
            </TerminalWindow>
          </div>
        ))}
      </div>
    </div>
  );
}
