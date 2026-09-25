"use client";

import { photos } from "@/data/photos";

export default function PhotosPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Photos</h1>
      <p className="mt-3 max-w-2xl text-foreground/70">
        A selection of photography. Drop your images into{" "}
        <code>/public/photos</code> and update{" "}
        <code>src/data/photos.ts</code> to replace these placeholders.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {photos.map((photo) => (
          <figure
            key={photo.src}
            className="group relative aspect-square overflow-hidden rounded-xl border border-black/10 bg-gradient-to-br from-black/5 to-black/10 dark:border-white/10 dark:from-white/5 dark:to-white/10"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <figcaption className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 text-center text-xs text-foreground/40">
              {photo.caption ?? photo.alt}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
