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
