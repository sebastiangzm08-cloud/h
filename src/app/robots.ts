import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: site.noIndexar
      ? { userAgent: "*", disallow: "/" }
      : [
          {
            userAgent: "*",
            allow: "/",
            disallow: [
              "/panel",
              "/panel/",
              "/acceso",
              "/acceso/",
              "/api/",
              "/orden/",
              "/demo/",
            ],
          },
        ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
