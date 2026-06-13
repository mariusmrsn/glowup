import { ImageResponse } from "next/og";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params;
  const size = sizeStr === "512" ? 512 : 192;
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.52);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#111118",
          borderRadius: radius,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#E0E0EC",
            fontSize,
            lineHeight: 1,
          }}
        >
          ✦
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
