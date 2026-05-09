import type { CartLine } from "@/features/cart/types";

export function createMockCartLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    id: overrides.id ?? "line-mock-id",
    productId: overrides.productId ?? "mock-product-id",
    quantity: overrides.quantity ?? 1,
    ...overrides,
  };
}
