import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogDetailToShopDisplay, previewToShopProductDisplay } from "@/features/products/factories/walmart-product.factory";
import { readWalmartCredentials } from "@/features/products/server/walmart-credentials.server";
import {
  loadProductLookupDetail,
  loadRelatedPreviewsParallel,
} from "@/features/products/server/walmart-gateway.server";
import { ProductDetailTemplate } from "@/features/products/ui/templates/product-detail-template";
import { routes } from "@/shared/constants/routes";
import { StoreShell } from "@/shared/layouts/store-shell";

export const dynamic = "force-dynamic";

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

    const descSlice = detail.longDescription ?? detail.shortDescription ?? "";
    return {
      title: `${detail.name} · Gapsi`,
      description: descSlice.length > 0 ? descSlice.slice(0, 155) : undefined,
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
