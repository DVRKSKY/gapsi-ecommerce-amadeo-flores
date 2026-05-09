"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  previewToProductDetailFromList,
  previewToShopProductDisplay,
} from "@/features/products/factories/walmart-product.factory";
import type { ProductPreview } from "@/features/products/models/product-ui.models";
import type { ProductsSearchResult } from "@/features/products/services/products.service";
import { ProductDetailTemplate } from "@/features/products/ui/templates/product-detail-template";
import { ProductDetailLoadFailed } from "./product-detail-load-failed";

function findCachedPreview(productId: string, qc: QueryClient): ProductPreview | null {
  const bucket = qc.getQueryCache().findAll({
    predicate: (q) =>
      Array.isArray(q.queryKey) &&
      q.queryKey.length >= 4 &&
      q.queryKey[0] === "products" &&
      q.queryKey[1] === "search",
  });
  for (const q of bucket) {
    const data = q.state.data as ProductsSearchResult | undefined;
    if (!data?.products?.length) continue;
    const hit = data.products.find((p) => p.id === productId);
    if (hit) return hit;
  }
  return null;
}

export type ProductDetailFromCacheProps = {
  productId: string;
  catalogBackHref: string;
  preserveCatalogSearch?: string;
};

export function ProductDetailFromCache({
  productId,
  catalogBackHref,
  preserveCatalogSearch,
}: ProductDetailFromCacheProps) {
  const qc = useQueryClient();
  const preview = findCachedPreview(productId, qc);

  if (!preview) {
    return (
      <ProductDetailLoadFailed
        message="No hay datos locales de este producto: abrilo desde «Ver detalle» en el catálogo (lista con búsqueda activa)."
        backHref={catalogBackHref}
      />
    );
  }

  const detail = previewToProductDetailFromList(preview);
  const cartProduct = previewToShopProductDisplay(preview);

  return (
    <ProductDetailTemplate
      detail={detail}
      cartProduct={cartProduct}
      catalogBackHref={catalogBackHref}
      preserveCatalogSearch={preserveCatalogSearch}
    />
  );
}
