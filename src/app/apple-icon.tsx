import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#111118",
          borderRadius: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#E0E0EC",
            fontSize: 94,
            lineHeight: 1,
          }}
        >
          ✦
        </div>
      </div>
    ),
    { ...size }
  );
}
