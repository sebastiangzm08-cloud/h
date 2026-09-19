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
        <svg width="112" height="112" viewBox="0 0 32 32" fill="none">
          <path
            d="M6 24L15 9L26 13"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M15 9L21 22"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="6" cy="24" r="2.3" fill="#ffffff" />
          <circle cx="15" cy="9" r="2.6" fill="#ffffff" />
          <circle cx="26" cy="13" r="2" fill="#ffffff" />
          <circle cx="21" cy="22" r="2" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
