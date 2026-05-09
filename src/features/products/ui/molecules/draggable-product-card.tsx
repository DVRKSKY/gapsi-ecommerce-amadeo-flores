"use client";

import { useRef } from "react";
import type { ShopProductDisplay } from "@/features/products/types";
import { useCartStore } from "@/features/cart";
import { useProductDrag } from "@/features/products/hooks/use-product-drag";
import { ProductCard } from "@/features/products/ui/molecules/product-card";
import { usePointerDragAllowed } from "@/shared/hooks/use-pointer-drag-allowed";
import { cn } from "@/shared/utils/cn";

export type DraggableProductCardProps = {
  product: ShopProductDisplay;
  preserveCatalogSearch?: string;
  className?: string;
};

export function DraggableProductCard({ product, preserveCatalogSearch, className }: DraggableProductCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragSurfaceRef = useRef<HTMLDivElement>(null);
  const dragAllowed = usePointerDragAllowed();

  const draggingActive = useCartStore(
    (s) => s.ui.draggingProductId !== null && s.ui.draggingProductId === product.id,
  );

  useProductDrag({
    product,
    targetRef: rootRef,
    triggerRef: dragSurfaceRef,
    enabled: dragAllowed,
  });

  if (!dragAllowed) {
    return (
      <ProductCard product={product} preserveCatalogSearch={preserveCatalogSearch} className={cn(className)} />
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "min-w-0 max-w-full rounded-2xl will-change-transform",
        draggingActive && "shadow-2xl ring-2 ring-sky-400/55 ring-offset-2 ring-offset-neutral-50 dark:ring-sky-500/55 dark:ring-offset-neutral-950",
        className,
      )}
    >
      <ProductCard
        product={product}
        preserveCatalogSearch={preserveCatalogSearch}
        dragLayout
        dragSurfaceRef={dragSurfaceRef}
        className="h-full"
      />
    </div>
  );
}
