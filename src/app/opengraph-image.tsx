import {
  ogImageSize as size,
  ogImageContentType as contentType,
  renderOgImage,
} from "@/lib/seo/og-image";

export { size, contentType };

export default function Image() {
  return renderOgImage();
}
