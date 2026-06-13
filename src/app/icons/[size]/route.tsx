import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params;
  const size = sizeStr === "512" ? 512 : 192;
  const radius = Math.round(size * 0.22);
  const star = Math.round(size * 0.52);

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
            display: "flex",
            background: "linear-gradient(180deg, #FFFFFF 0%, #E0E0EC 60%, #9090A8 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            fontSize: star,
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
