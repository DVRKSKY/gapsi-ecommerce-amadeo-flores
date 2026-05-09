import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/shared/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin().origin;
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${origin}/sitemap.xml`,
  };
}
