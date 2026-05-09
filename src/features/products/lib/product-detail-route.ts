import { routes } from "@/shared/constants/routes";

export function productDetailPath(productId: string, preserveCatalogSearch?: string): string {
  const base = routes.product(productId);
  const q = preserveCatalogSearch?.trim();
  if (!q || q.length === 0) return base;
  return `${base}?${new URLSearchParams({ search: q }).toString()}`;
}
