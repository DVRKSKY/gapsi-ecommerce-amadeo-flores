function catalogPagedPath(searchRaw: string, page = 1): string {
  const q = searchRaw.trim();
  if (!q.length) return "/products";
  const sp = new URLSearchParams({ search: q });
  const p = Number.isFinite(page) ? Math.floor(page) : 1;
  if (p > 1) sp.set("page", String(p));
  return `/products?${sp.toString()}`;
}

export const routes = {
  home: "/",
  products: "/products",
  product: (id: string) => `/products/${encodeURIComponent(id)}`,
  catalogWithSearch: (searchRaw: string) => catalogPagedPath(searchRaw, 1),
  catalogPaged: catalogPagedPath,
  cart: "/cart",
  checkout: "/checkout",
} as const;
