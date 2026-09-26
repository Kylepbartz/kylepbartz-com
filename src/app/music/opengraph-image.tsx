import { renderOgImage, ogImageSize, ogImageContentType } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image() {
  return renderOgImage({
    process: "audio_test.exe",
    title: "MUSIC",
    subtitle: "Tracks I've written, produced, or performed.",
  });
}
