import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogDetailToShopDisplay, previewToShopProductDisplay } from "@/features/products/factories/walmart-product.factory";
import { readWalmartCredentials } from "@/features/products/server/walmart-credentials.server";
import {
  loadProductLookupDetail,
  loadRelatedPreviewsParallel,
} from "@/features/products/server/walmart-gateway.server";
import { ProductDetailTemplate } from "@/features/products/ui/templates/product-detail-template";
import { APP_NAME } from "@/shared/constants/app";
import { routes } from "@/shared/constants/routes";
import { SEO_KEYWORDS } from "@/shared/constants/seo";
import { getSiteOrigin } from "@/shared/lib/site-url";
import { StoreShell } from "@/shared/layouts/store-shell";

export const dynamic = "force-dynamic";

function truncateMeta(text: string, max: number): string {
  const s = text.trim().replace(/\s+/g, " ");
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ search?: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  try {
    const { id } = await props.params;
    const decoded = decodeURIComponent(id);
    const creds = readWalmartCredentials();
    if (!creds) return { title: "Producto" };

    const { detail } = await loadProductLookupDetail(creds, decoded);
    if (!detail) return { title: "Producto" };

    const rawDesc = detail.longDescription ?? detail.shortDescription ?? "";
    const description = rawDesc.length > 0 ? truncateMeta(rawDesc, 155) : undefined;
    const origin = getSiteOrigin();
    const canonicalPath = routes.product(decoded);
    const canonical = new URL(canonicalPath, origin).href;
    const imageUrl =
      detail.gallery[0]?.url ?? detail.image.url ?? detail.image.thumbnailUrl ?? undefined;
    const keywords = [...SEO_KEYWORDS, detail.name, detail.brandText, detail.categoryText].filter(
      (k): k is string => typeof k === "string" && k.trim().length > 0,
    );

    const title = truncateMeta(detail.name, 64);

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        type: "website",
        locale: "es_MX",
        url: canonical,
        title: `${title} · ${APP_NAME}`,
        description,
        siteName: APP_NAME,
        ...(imageUrl ? { images: [{ url: imageUrl, alt: detail.name }] } : {}),
      },
      twitter: {
        card: imageUrl ? "summary_large_image" : "summary",
        title: `${title} · ${APP_NAME}`,
        description,
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
    };
  } catch {
    return { title: "Producto" };
  }
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const [{ id }, spResolved] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as Record<string, string | string[] | undefined>),
  ]);
  const decoded = decodeURIComponent(id);
  const creds = readWalmartCredentials();
  if (!creds) {
    notFound();
  }

  const detailPack = await loadProductLookupDetail(creds, decoded);
  const { detail } = detailPack;
  if (!detail) {
    notFound();
  }

  const searchRaw = typeof spResolved.search === "string" ? spResolved.search : undefined;
  const preserve =
    typeof searchRaw === "string" && searchRaw.trim().length > 0 ? searchRaw.trim() : undefined;

  const catalogBackHref = routes.catalogWithSearch(preserve ?? "");

  const relatedPreviews = await loadRelatedPreviewsParallel(
    creds,
    detail.relatedSearchHints.length ? detail.relatedSearchHints : [detail.name],
    detail.id,
    8,
  );

  const related = relatedPreviews.filter((p) => p.id !== detail.id).map(previewToShopProductDisplay);

  const cartProduct = catalogDetailToShopDisplay(detail);

  return (
    <StoreShell>
      <ProductDetailTemplate
        detail={detail}
        cartProduct={cartProduct}
        related={related}
        catalogBackHref={catalogBackHref}
        preserveCatalogSearch={preserve}
      />
    </StoreShell>
  );
}
