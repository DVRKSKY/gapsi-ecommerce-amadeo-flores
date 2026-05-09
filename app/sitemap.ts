import type { MetadataRoute } from "next";
import { DEFAULT_INITIAL_CATALOG_SEARCH } from "@/features/products/constants/search-ui";
import { routes } from "@/shared/constants/routes";
import { getSiteOrigin } from "@/shared/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteOrigin();
  const now = new Date();

  const catalogMain = routes.catalogWithSearch(DEFAULT_INITIAL_CATALOG_SEARCH);

  return [
    {
      url: new URL("/", base).href,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL(catalogMain, base).href,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
  ];
}
