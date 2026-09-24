import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a12",
        }}
      >
        <svg width="124" height="124" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 3L23.6 26.5L3.6 12L28.4 12L8.4 26.5Z"
            stroke="#ffffff"
            strokeWidth="2.1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="16" cy="3" r="2.5" fill="#ffffff" />
          <circle cx="23.6" cy="26.5" r="2.5" fill="#ffffff" />
          <circle cx="3.6" cy="12" r="2.5" fill="#ffffff" />
          <circle cx="28.4" cy="12" r="2.5" fill="#ffffff" />
          <circle cx="8.4" cy="26.5" r="2.5" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
