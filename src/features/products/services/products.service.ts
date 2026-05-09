import { httpClient } from "@/shared/api/http-client";
import { endpoints } from "@/shared/api/endpoints";
import type { ProductDetail, ProductPreview } from "../models/product-ui.models";

export type ProductsSearchParams = {
  search: string;
  page?: number;
};

export type ProductsSearchResult = {
  products: ProductPreview[];
  search: string;
  page: number;
};

type ProductsSearchApiSuccessBody = ProductsSearchResult;

type ProductDetailApiSuccessBody = {
  product: ProductDetail;
};

function buildProductsSearchQuery(params: ProductsSearchParams): string {
  const page = params.page ?? 1;
  const q = new URLSearchParams({
    search: params.search.trim(),
    page: String(page),
  });
  return `${endpoints.products}?${q.toString()}`;
}

export async function getProducts(params: ProductsSearchParams): Promise<ProductsSearchResult> {
  const search = params.search.trim();
  if (!search.length) {
    throw new RangeError("search no puede estar vacío.");
  }

  const path = buildProductsSearchQuery({ search, page: params.page ?? 1 });
  return httpClient<ProductsSearchApiSuccessBody>(path, { method: "GET" });
}

export async function searchProducts(term: string, page = 1): Promise<ProductsSearchResult> {
  const search = term.trim();
  if (!search.length) {
    return { products: [], search: "", page };
  }
  return getProducts({ search, page });
}

export async function getProductDetail(itemIdRaw: string): Promise<ProductDetail> {
  const itemId = decodeURIComponent(itemIdRaw).trim();
  if (!itemId.length) {
    throw new RangeError("itemId inválido.");
  }

  const path = `${endpoints.products}?${new URLSearchParams({ itemId }).toString()}`;
  const body = await httpClient<ProductDetailApiSuccessBody>(path, { method: "GET" });
  return body.product;
}
