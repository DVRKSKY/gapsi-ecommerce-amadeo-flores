"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { HttpError } from "@/shared/api/errors";
import { PRODUCTS_QUERY_STALE_MS } from "../constants/search-ui";
import { productsQueryKeys } from "../lib/products-query-keys";
import { getProducts } from "../services/products.service";

export type UseInfiniteProductsQueryArgs = {
  search: string;
  enabled?: boolean;
};

export function useInfiniteProductsQuery({ search, enabled = true }: UseInfiniteProductsQueryArgs) {
  const trimmed = search.trim();
  const shouldFetch = Boolean(enabled && trimmed.length > 0);

  return useInfiniteQuery({
    queryKey: productsQueryKeys.infiniteSearch(trimmed),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getProducts({ search: trimmed, page: typeof pageParam === "number" ? pageParam : 1 }),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: shouldFetch,
    staleTime: PRODUCTS_QUERY_STALE_MS,
    retry: (failureCount, error) => {
      if (error instanceof HttpError && error.status >= 400 && error.status < 500) return false;
      return failureCount < 1;
    },
  });
}
