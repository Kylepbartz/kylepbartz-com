export type Track = {
  title: string;
  description: string;
  soundcloudTrackId?: string;
  audioSrc?: string;
  externalUrl?: string;
};

export const tracks: Track[] = [
  {
    title: "Doom E1M1 Cover",
    description:
      "A cover of the Doom (1993) E1M1 “At Doom's Gate” theme.",
    soundcloudTrackId: "1356735781",
    externalUrl: "https://soundcloud.com/kyle-bartz-866526878/doom-e1m1-cover",
  },
];

export const soundcloudProfileUrl = "https://soundcloud.com/kyle-bartz-866526878";
