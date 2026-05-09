import type { Product } from "@/features/products/types";

export function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: overrides.id ?? "mock-id",
    name: overrides.name ?? "Producto",
    price: overrides.price ?? 0,
    ...overrides,
  };
}
