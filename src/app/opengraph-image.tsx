import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          color: "#ededed",
          padding: "80px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#a1a1a1", letterSpacing: 4 }}>
          HI, I&apos;M
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, marginTop: 16 }}>
          Kyle Bartz
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#a1a1a1",
            marginTop: 24,
            maxWidth: 900,
          }}
        >
          Instructional Designer & Audio Engineer
        </div>
      </div>
    ),
    { ...size }
  );
}
