import type { Metadata } from "next";
import { videos } from "@/data/videos";
import PageHeader from "@/components/PageHeader";
import TerminalWindow from "@/components/TerminalWindow";

export const metadata: Metadata = {
  title: "Video - Kyle Bartz",
};

export default function VideoPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        process="moving_pictures.exe"
        title="VIDEO"
        subtitle="Animated training and demo videos created in Vyond."
      />

      <div className="flex flex-col gap-8">
        {videos.map((video, i) => (
          <div
            key={video.youtubeId}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <TerminalWindow title={`${video.youtubeId}.mp4`}>
              <div className="-m-5 mb-0 aspect-video w-[calc(100%+2.5rem)] overflow-hidden border-b border-(--border-color)">
                <iframe
                  title={video.title}
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h2 className="font-display mt-4 text-sm tracking-widest">
                {video.title.toUpperCase()}
              </h2>
              <p className="mt-2 text-sm text-foreground/60">
                {video.description}
              </p>
            </TerminalWindow>
          </div>
        ))}
      </div>
    </div>
  );
}
