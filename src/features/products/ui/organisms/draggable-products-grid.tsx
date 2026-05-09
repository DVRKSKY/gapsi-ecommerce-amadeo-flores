"use client";

import { useMemo } from "react";
import { useCartStore } from "@/features/cart";
import type { ShopProductDisplay } from "@/features/products/types";
import { DraggableProductCard } from "@/features/products/ui/molecules/draggable-product-card";
import { cn } from "@/shared/utils/cn";

export type DraggableProductsGridProps = {
  products: ShopProductDisplay[];
  preserveCatalogSearch?: string;
  className?: string;
  /** Si es true, oculta ítems que ya están en el carrito (secciones compactas). En catálogo paginado conviene false. */
  omitInCart?: boolean;
};

export function DraggableProductsGrid({
  products,
  preserveCatalogSearch,
  className,
  omitInCart = true,
}: DraggableProductsGridProps) {
  const lines = useCartStore((s) => s.lines);

  const excluded = useMemo(() => new Set(lines.map((l) => l.productId)), [lines]);
  const visible = useMemo(
    () => (omitInCart ? products.filter((p) => !excluded.has(p.id)) : products),
    [products, excluded, omitInCart],
  );

  return (
    <ul className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {visible.map((product) => (
        <li key={product.id}>
          <DraggableProductCard
            product={product}
            preserveCatalogSearch={preserveCatalogSearch}
            className="h-full"
          />
        </li>
      ))}
    </ul>
  );
}
