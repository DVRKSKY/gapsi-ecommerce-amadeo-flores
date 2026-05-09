"use client";

import { useCartStore } from "@/features/cart/stores/cart-store";

export function useRemoveCartLine() {
  return useCartStore((s) => s.removeLineById);
}
