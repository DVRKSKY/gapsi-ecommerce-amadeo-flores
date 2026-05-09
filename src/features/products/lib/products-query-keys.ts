export const productsQueryKeys = {
  search: (search: string, page: number) => ["products", "search", search, page] as const,
  infiniteSearch: (search: string) => ["products", "search", "infinite", search] as const,
};
