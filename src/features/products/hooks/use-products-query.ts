"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { HttpError } from "@/shared/api/errors";
import { PRODUCTS_QUERY_STALE_MS } from "../constants/search-ui";
import { productsQueryKeys } from "../lib/products-query-keys";
import { searchProducts } from "../services/products.service";

export type UseProductsQueryArgs = {
  search: string;
  page?: number;
  enabled?: boolean;
};

export function useProductsQuery({ search, page = 1, enabled = true }: UseProductsQueryArgs) {
  const trimmed = search.trim();
  const shouldFetch = Boolean(enabled && trimmed.length > 0);

  return useQuery({
    queryKey: productsQueryKeys.search(trimmed, page),
    queryFn: () => searchProducts(trimmed, page),
    enabled: shouldFetch,
    staleTime: PRODUCTS_QUERY_STALE_MS,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
