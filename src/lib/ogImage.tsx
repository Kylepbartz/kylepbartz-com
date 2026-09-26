import { ImageResponse } from "next/og";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

export function renderOgImage({
  process,
  title,
  subtitle,
}: {
  process: string;
  title: string;
  subtitle: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#0a0a0a",
          color: "#e8e8e3",
          padding: "80px",
          fontFamily: "Courier New, monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#39ff88",
            letterSpacing: 6,
          }}
        >
          RUNNING_ {process}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            padding: "24px 48px",
            border: "3px solid #e8e8e3",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: 6,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#8a8a85",
            marginTop: 28,
            maxWidth: 950,
            letterSpacing: 3,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#39ff88",
            marginTop: "auto",
            letterSpacing: 4,
          }}
        >
          KYLEPBARTZ.COM
        </div>
      </div>
    ),
    { ...ogImageSize }
  );
}
