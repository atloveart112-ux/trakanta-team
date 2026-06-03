import { ImageResponse } from "next/og";

export const dynamic = "force-static";

/**
 * 512x512 maskable icon for PWA install on Android.
 * Generated via ImageResponse and served as PNG.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #E07A5F, #F2A4B0)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "serif",
          fontWeight: 700,
          fontSize: 360,
        }}
      >
        ต
      </div>
    ),
    { width: 512, height: 512 },
  );
}
