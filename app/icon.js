import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(110deg,#4b0cff,#9b18f8)", borderRadius: 14 }}>
        <div style={{ width: 0, height: 0, marginLeft: 6, borderTop: "14px solid transparent", borderBottom: "14px solid transparent", borderLeft: "24px solid white" }} />
      </div>
    ),
    size
  );
}