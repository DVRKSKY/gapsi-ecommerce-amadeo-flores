"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HttpError } from "@/shared/api/errors";
import { useIntersectionObserver } from "@/shared/hooks/use-intersection-observer";
import { routes } from "@/shared/constants/routes";
import { Spinner } from "@/shared/ui/atoms/spinner";
import { Typography } from "@/shared/ui/atoms/typography";
import { SUGGESTED_PRODUCT_QUERIES } from "../../constants/search-ui";
import { previewToShopProductDisplay } from "../../factories/walmart-product.factory";
import { useInfiniteProductsQuery } from "../../hooks/use-infinite-products-query";
import type { ProductPreview } from "../../models/product-ui.models";
import type { ShopProductDisplay } from "../../types";
import { ProductsGridSkeleton } from "./products-grid-skeleton";
import { VirtualizedDraggableProductsGrid } from "./virtualized-draggable-products-grid";
import { cn } from "@/shared/utils/cn";

function summarizeError(error: unknown): string {
  if (error instanceof HttpError && error.body !== null && typeof error.body === "object") {
    const rec = error.body as Record<string, unknown>;
    const msg = rec["error"];
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return "No se pudo completar la búsqueda. Intentá de nuevo.";
}

function dedupeFlattenPages(pages: { products: ProductPreview[] }[]): ShopProductDisplay[] {
  const seen = new Set<string>();
  const out: ShopProductDisplay[] = [];
  for (const pg of pages) {
    for (const pv of pg.products) {
      const sd = previewToShopProductDisplay(pv);
      if (seen.has(sd.id)) continue;
      seen.add(sd.id);
      out.push(sd);
    }
  }
  return out;
}

export type WalmartProductsCatalogProps = {
  catalogSearch: string;
  title?: string;
  description?: string;
  className?: string;
};

export function WalmartProductsCatalog({
  catalogSearch,
  title = "Walmart marketplace",
  description,
  className,
}: WalmartProductsCatalogProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const searchFromUrl = sp.get("search")?.trim() ?? "";
  const searchTerm = useMemo(() => {
    const fromServer = catalogSearch.trim();
    return searchFromUrl.length > 0 ? searchFromUrl : fromServer;
  }, [catalogSearch, searchFromUrl]);

  function applySearch(term: string) {
    router.replace(routes.catalogWithSearch(term.trim()));
  }

  const {
    data,
    isPending,
    isFetching,
    isFetchingNextPage,
    isError,
    error,
    refetch,
    fetchStatus,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteProductsQuery({
    search: searchTerm,
    enabled: searchTerm.length > 0,
  });

  const flatProducts = useMemo(() => dedupeFlattenPages(data?.pages ?? []), [data]);

  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);

  const loadMoreNearEnd = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const { ref: observeSentinelTarget, isIntersecting } = useIntersectionObserver({
    root: scrollRoot ?? undefined,
    rootMargin: "120px",
    threshold: 0,
    enabled: Boolean(scrollRoot && hasNextPage && searchTerm.length > 0),
  });

  useEffect(() => {
    if (!isIntersecting) return;
    loadMoreNearEnd();
  }, [isIntersecting, loadMoreNearEnd, flatProducts.length]);

  const showInitialHints = searchTerm.length === 0;
  const showEmptyResult =
    !isPending &&
    !isError &&
    searchTerm.length > 0 &&
    flatProducts.length === 0 &&
    !isFetching;

  const defaultDescription =
    "Resultados desde la API (proxy en servidor). Buscá con la barra superior o usá estos atajos.";
  const descriptionText = description ?? defaultDescription;

  const showStuckHint =
    searchTerm.length > 0 && fetchStatus === "idle" && !data && !isPending && !isError;

  return (
    <section className={cn("space-y-6", className)} aria-labelledby="catalogo-walmart-titulo">
      <div className="space-y-3">
        <Typography as="h2" id="catalogo-walmart-titulo" variant="display" className="text-balance">
          {title}
        </Typography>
        <Typography variant="subtitle" className="max-w-2xl text-pretty">
          {descriptionText}{" "}
          {searchTerm.length > 0 ? (
            <span className="text-neutral-600 dark:text-neutral-400">
              Búsqueda actual: «{searchTerm}».
            </span>
          ) : null}
        </Typography>
      </div>

      <div className="space-y-2">
        <Typography variant="label" className="text-neutral-600 dark:text-neutral-400">
          Atajos de búsqueda
        </Typography>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PRODUCT_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                q === searchTerm
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                  : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-600 dark:hover:bg-neutral-900",
              )}
              onClick={() => applySearch(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {showInitialHints ? (
        <Typography variant="muted" className="max-w-xl text-sm">
          Sin término de búsqueda. Elegí un atajo o usá la barra de búsqueda del encabezado.
        </Typography>
      ) : null}

      {showStuckHint ? (
        <Typography variant="muted" className="text-sm">
          La petición no se disparó todavía. Probá refrescar la página.
        </Typography>
      ) : null}

      {isPending ? <ProductsGridSkeleton count={8} /> : null}

      {isError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/55 dark:bg-red-950/40"
        >
          <Typography variant="subtitle" className="text-red-900 dark:text-red-100">
            {summarizeError(error)}
          </Typography>
          <Typography variant="muted" className="mt-2 text-xs">
            Revisa la pestaña Network por la llamada a{" "}
            <code className="rounded bg-neutral-200/70 px-1 dark:bg-neutral-800">/api/products?search=…</code>
            y tu{" "}
            <code className="rounded bg-neutral-200/70 px-1 dark:bg-neutral-800">.env.local</code> con RapidAPI.
          </Typography>
          <button
            type="button"
            className="mt-2 text-sm font-semibold underline underline-offset-2"
            onClick={() => void refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {showEmptyResult ? (
        <Typography variant="muted" className="text-center">
          Sin resultados para «{searchTerm}». La API respondió pero el listado llegó vacío (revisá el formato de RapidAPI).
        </Typography>
      ) : null}

      {!isPending && flatProducts.length > 0 ? (
        <div className="space-y-4">
          {isFetching && !isFetchingNextPage ? (
            <Typography variant="muted" className="text-sm">
              Actualizando…
            </Typography>
          ) : null}

          <VirtualizedDraggableProductsGrid
            products={flatProducts}
            preserveCatalogSearch={searchTerm}
            observeSentinelRef={observeSentinelTarget}
            onOuterScrollMount={setScrollRoot}
          />

          {isFetchingNextPage ? (
            <div className="space-y-3 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
              <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                <Spinner aria-hidden />
                <Typography variant="subtitle" className="text-sm">
                  Cargando más resultados…
                </Typography>
              </div>
              <ProductsGridSkeleton count={6} />
            </div>
          ) : null}

          {!hasNextPage && !isFetchingNextPage ? (
            <Typography variant="muted" className="text-center text-sm">
              Fin del catálogo para esta búsqueda.
            </Typography>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
