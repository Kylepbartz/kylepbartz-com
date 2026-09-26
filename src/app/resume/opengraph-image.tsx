import { renderOgImage, ogImageSize, ogImageContentType } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image() {
  return renderOgImage({
    process: "cv.exe",
    title: "RESUME",
    subtitle: "Instructional designer / audio engineer / video editor.",
  });
}
