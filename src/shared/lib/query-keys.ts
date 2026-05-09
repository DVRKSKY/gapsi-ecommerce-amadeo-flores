export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.products.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.products.all, "detail", id] as const,
  },
  cart: {
    all: ["cart"] as const,
  },
} as const;
