"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/features/cart";
import { Button } from "@/shared/ui/atoms/button";
import type { ShopProductDisplay } from "@/features/products/types";

export type ProductAddToCartButtonProps = {
  product: ShopProductDisplay;
  className?: string;
};

export function ProductAddToCartButton({ product, className }: ProductAddToCartButtonProps) {
  const addProduct = useCartStore((s) => s.addProduct);
  const [phase, setPhase] = useState<"idle" | "added">("idle");

  useEffect(() => {
    if (phase !== "added") return;
    const t = window.setTimeout(() => setPhase("idle"), 1800);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <Button
      type="button"
      variant="primary"
      size="lg"
      className={className}
      aria-label={`Añadir al carrito ${product.name}`}
      onClick={() => {
        addProduct(product);
        setPhase("added");
      }}
      disabled={phase === "added"}
    >
      {phase === "added" ? "Añadido" : "Añadir al carrito"}
    </Button>
  );
}
