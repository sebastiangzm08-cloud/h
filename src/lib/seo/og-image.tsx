import { ImageResponse } from "next/og";
import { site } from "@/config/site";

/** Imagen de preview compartida por opengraph-image.tsx y twitter-image.tsx
    (misma marca, generada en código para no depender de un PNG pesado). */
export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "#0a0a12",
          fontFamily: "sans-serif",
        }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 32 32"
          fill="none"
          style={{ marginBottom: 40 }}
        >
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
        <div
          style={{
            fontSize: 76,
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          {site.nombre}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 34,
            color: "#a6a6b8",
            lineHeight: 1.3,
            maxWidth: 900,
          }}
        >
          {site.claim}
        </div>
      </div>
    ),
    { ...ogImageSize }
  );
}
