import { tracks } from "@/data/tracks";
import { videos } from "@/data/videos";
import { profile, skills } from "@/data/resume";
import { email, phone, linkedin } from "@/data/contact";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type VFile = { name: string; content: string };

/** Files in the terminal's virtual "/projects" directory, generated from the
 * same data that drives the music and video pages so `cat` never drifts out
 * of sync with the real content. */
export const projectFiles: VFile[] = [
  ...tracks.map((t) => ({
    name: `${slugify(t.title)}.txt`,
    content: [
      t.title.toUpperCase(),
      "type: music",
      "",
      t.description,
      "",
      t.externalUrl && `listen: ${t.externalUrl}`,
      "more: cd music",
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n"),
  })),
  ...videos.map((v) => ({
    name: `${slugify(v.title)}.txt`,
    content: [
      v.title.toUpperCase(),
      "type: video",
      "",
      v.description,
      "",
      `watch: https://youtu.be/${v.youtubeId}`,
      "more: cd video",
    ].join("\n"),
  })),
];

/** Files in the terminal's virtual root directory. */
export const rootFiles: VFile[] = [
  {
    name: "about.txt",
    content: [
      "KYLE_PATRICK_BARTZ",
      "instructional designer / audio engineer / video editor",
      "",
      "Since I was a kid in Milwaukee I've loved music and recording. This is where I keep my design work, music, and video projects in one place.",
      "",
      profile,
    ].join("\n"),
  },
  {
    name: "contact.txt",
    content: [
      `email: ${email}`,
      `phone: ${phone}`,
      `linkedin: ${linkedin}`,
    ].join("\n"),
  },
  {
    name: "resume.txt",
    content: [
      profile,
      "",
      "SKILLS",
      ...skills.map((s) => `- ${s}`),
      "",
      "full history: cd resume",
    ].join("\n"),
  },
];

export const projectsDirName = "projects";
