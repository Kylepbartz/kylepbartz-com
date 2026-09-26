import { renderOgImage, ogImageSize, ogImageContentType } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image() {
  return renderOgImage({
    process: "moving_pictures.exe",
    title: "VIDEO",
    subtitle: "Animated training and demo videos created in Vyond.",
  });
}
