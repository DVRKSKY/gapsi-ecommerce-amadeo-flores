export const routes = {
  home: "/",
  products: "/products",
  product: (id: string) => `/products/${encodeURIComponent(id)}`,
  catalogWithSearch: (searchRaw: string) => {
    const q = searchRaw.trim();
    if (!q.length) return "/products";
    const sp = new URLSearchParams({ search: q });
    return `/products?${sp.toString()}`;
  },
  cart: "/cart",
  checkout: "/checkout",
} as const;
