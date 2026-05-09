import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ShopTemplate } from "@/shared/layouts/shop-template";
import { WalmartProductsCatalog } from "@/features/products/ui/organisms/walmart-products-catalog";
import { ProductsGridSkeleton } from "@/features/products/ui/organisms/products-grid-skeleton";
import { APP_NAME } from "@/shared/constants/app";
import { routes } from "@/shared/constants/routes";
import { SEO_DEFAULT_DESCRIPTION } from "@/shared/constants/seo";
import { DEFAULT_INITIAL_CATALOG_SEARCH } from "@/features/products/constants/search-ui";

type Props = {
  searchParams?: Promise<{ search?: string; page?: string }>;
};

function parseCatalogPageKey(raw: unknown): number {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!/^\d+$/.test(s)) return 1;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function truncateMeta(text: string, max: number): string {
  const s = text.trim();
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = (await searchParams) ?? {};
  const raw = typeof sp.search === "string" ? sp.search.trim() : "";
  const termForCanonical = raw.length > 0 ? raw : DEFAULT_INITIAL_CATALOG_SEARCH;
  const canonicalPath = routes.catalogWithSearch(termForCanonical);

  const title =
    raw.length > 0
      ? `${truncateMeta(raw, 52)} · Catálogo`
      : "Catálogo de productos · búsqueda";

  const description =
    raw.length > 0
      ? `Explora «${truncateMeta(raw, 72)}» en ${APP_NAME}. Precios en pesos mexicanos, vista detalle y carrito lateral.`
      : SEO_DEFAULT_DESCRIPTION;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      locale: "es_MX",
      url: canonicalPath,
      title,
      description,
      siteName: APP_NAME,
      images: [{ url: "/logo.png", alt: APP_NAME, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const initialSearch = typeof sp.search === "string" ? sp.search.trim() : "";
  const pageKey = parseCatalogPageKey(sp.page);

  if (initialSearch.length === 0) {
    redirect(routes.catalogWithSearch(DEFAULT_INITIAL_CATALOG_SEARCH));
  }

  return (
    <ShopTemplate>
      <Suspense fallback={<ProductsGridSkeleton count={6} />}>
        <WalmartProductsCatalog key={`${initialSearch}|${pageKey}`} catalogSearch={initialSearch} />
      </Suspense>
    </ShopTemplate>
  );
}
