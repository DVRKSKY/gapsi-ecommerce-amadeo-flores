import type { MetadataRoute } from "next";
import { APP_NAME } from "@/shared/constants/app";
import { DEFAULT_INITIAL_CATALOG_SEARCH } from "@/features/products/constants/search-ui";
import { routes } from "@/shared/constants/routes";
import { SEO_DEFAULT_DESCRIPTION, THEME_COLOR_LIGHT } from "@/shared/constants/seo";

const catalogDefaultPath = `${routes.products}?search=${encodeURIComponent(DEFAULT_INITIAL_CATALOG_SEARCH)}`;

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: APP_NAME,
    short_name: "Gapsi Shop",
    description: SEO_DEFAULT_DESCRIPTION,
    lang: "es",
    dir: "ltr",
    scope: "/",
    start_url: catalogDefaultPath,
    display: "standalone",
    orientation: "any",
    background_color: THEME_COLOR_LIGHT,
    theme_color: THEME_COLOR_LIGHT,
    categories: ["shopping", "utilities"],
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Catálogo",
        short_name: "Catálogo",
        description: "Ver productos y buscar",
        url: catalogDefaultPath,
        icons: [{ src: "/icon.png", sizes: "96x96", type: "image/png" }],
      },
    ],
    prefer_related_applications: false,
  };
}
