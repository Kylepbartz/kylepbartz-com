import type { Metadata } from "next";
import { videos } from "@/data/videos";

export const metadata: Metadata = {
  title: "Video - Kyle Bartz",
};

export default function VideoPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="animate-fade-up text-4xl font-bold tracking-tight">
        Video
      </h1>
      <p className="mt-3 text-foreground/70">
        Animated training and demo videos created in Vyond.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {videos.map((video) => (
          <div key={video.youtubeId}>
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
              <iframe
                title={video.title}
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h2 className="mt-3 text-lg font-semibold">{video.title}</h2>
            <p className="mt-1 text-sm text-foreground/60">
              {video.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
