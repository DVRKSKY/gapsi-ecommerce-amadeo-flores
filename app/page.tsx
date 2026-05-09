import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DEFAULT_INITIAL_CATALOG_SEARCH } from "@/features/products/constants/search-ui";
import { routes } from "@/shared/constants/routes";
import { SEO_DEFAULT_DESCRIPTION } from "@/shared/constants/seo";

/** SEO para `/` antes del redirect al catálogo inicial. */
export const metadata: Metadata = {
  title: "Catálogo de productos · inicio",
  description: SEO_DEFAULT_DESCRIPTION,
};

export default function HomePage() {
  redirect(routes.catalogWithSearch(DEFAULT_INITIAL_CATALOG_SEARCH));
}
