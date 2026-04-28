import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "20%",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            background: "#22c55e",
            borderRadius: "50%",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
