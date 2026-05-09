export const productsQueryKeys = {
  search: (search: string, page: number) => ["products", "search", search, page] as const,
};
