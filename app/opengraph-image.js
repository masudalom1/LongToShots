import { ImageResponse } from "next/og";
import { SITE } from "./site";

export const alt = `${SITE.name} – ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#100747,#4400b9)", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
          <div style={{ width: 84, height: 84, borderRadius: 20, background: "linear-gradient(110deg,#4b0cff,#9b18f8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, marginLeft: 8, borderTop: "20px solid transparent", borderBottom: "20px solid transparent", borderLeft: "34px solid white" }} />
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, marginLeft: 24 }}>{SITE.name}</div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.1 }}>Turn long videos into Shorts &amp; Reels</div>
        <div style={{ fontSize: 34, marginTop: 28, color: "#d9c5ff" }}>Free · Unlimited · No watermark · AI captions</div>
        <div style={{ fontSize: 30, marginTop: 44, color: "#a78bfa" }}>{SITE.domain}</div>
      </div>
    ),
    size
  );
}