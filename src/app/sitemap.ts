import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const ROUTES = ["", "/music", "/video", "/resume"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();
  return ROUTES.map((route) => ({
    url: `${base}${route}`,
    lastModified,
  }));
}
