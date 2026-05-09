"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { HttpError } from "@/shared/api/errors";
import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/atoms/button";
import { Typography } from "@/shared/ui/atoms/typography";
import { SUGGESTED_PRODUCT_QUERIES } from "../../constants/search-ui";
import { previewToShopProductDisplay } from "../../factories/walmart-product.factory";
import { useProductsQuery } from "../../hooks/use-products-query";
import type { ProductPreview } from "../../models/product-ui.models";
import type { ShopProductDisplay } from "../../types";
import { DraggableProductsGrid } from "./draggable-products-grid";
import { ProductsGridSkeleton } from "./products-grid-skeleton";
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

function parsePageParam(raw: string | null): number {
  if (raw === null) return 1;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return n;
}

function dedupeProductPreviews(rows: readonly ProductPreview[]): ProductPreview[] {
  const seen = new Set<string>();
  const out: ProductPreview[] = [];
  for (const p of rows) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

export type WalmartProductsCatalogProps = {
  catalogSearch: string;
  title?: string;
  className?: string;
};

export function WalmartProductsCatalog({
  catalogSearch,
  title = "Walmart marketplace",
  className,
}: WalmartProductsCatalogProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const searchFromUrl = sp.get("search")?.trim() ?? "";
  const searchTerm = useMemo(() => {
    const fromServer = catalogSearch.trim();
    return searchFromUrl.length > 0 ? searchFromUrl : fromServer;
  }, [catalogSearch, searchFromUrl]);

  const page = parsePageParam(sp.get("page"));

  useEffect(() => {
    const root = document.getElementById("contenido-tienda");
    if (root instanceof HTMLElement) root.scrollTo({ top: 0, behavior: "auto" });
  }, [page, searchTerm]);

  function goToCatalogSearch(term: string) {
    router.replace(routes.catalogPaged(term.trim(), 1));
  }

  const {
    data,
    isPending,
    isFetching,
    isPlaceholderData,
    isError,
    error,
    refetch,
    fetchStatus,
  } = useProductsQuery({
    search: searchTerm,
    page,
    enabled: searchTerm.length > 0,
  });

  const flatProducts: ShopProductDisplay[] = useMemo(() => {
    const unique = dedupeProductPreviews(data?.products ?? []);
    return unique.map((p) => previewToShopProductDisplay(p));
  }, [data?.products]);

  const showInitialHints = searchTerm.length === 0;
  const showEmptyResult =
    !isPending &&
    !isError &&
    searchTerm.length > 0 &&
    flatProducts.length === 0 &&
    !isFetching;

  const showStuckHint =
    searchTerm.length > 0 && fetchStatus === "idle" && !data && !isPending && !isError;

  const hasMore = Boolean(data?.hasMore);
  const canPrev = page > 1 && !isFetching;
  const canNext = hasMore && !isFetching;

  return (
    <section className={cn("space-y-6", className)} aria-labelledby="catalogo-walmart-titulo">
      <div>
        <Typography as="h2" id="catalogo-walmart-titulo" variant="display" className="text-balance">
          {title}
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
              onClick={() => goToCatalogSearch(q)}
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
        <div className="space-y-6">
          <div
            className={cn(
              "rounded-3xl bg-transparent transition-opacity duration-150",
              isFetching && isPlaceholderData ? "opacity-[0.72]" : "opacity-100",
            )}
            aria-busy={isFetching ? true : undefined}
          >
            <DraggableProductsGrid
              products={flatProducts}
              preserveCatalogSearch={searchTerm}
              omitInCart={false}
            />
          </div>

          <nav
            className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80"
            aria-label="Paginación de resultados"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => router.replace(routes.catalogPaged(searchTerm, page - 1))}
            >
              ← Anterior
            </Button>
            <Typography variant="subtitle" className="tabular-nums text-sm text-neutral-600 dark:text-neutral-400">
              Página {page}
              {isFetching ? (
                <span className="ml-2 text-xs font-normal text-neutral-400">Actualizando…</span>
              ) : null}
            </Typography>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() => router.replace(routes.catalogPaged(searchTerm, page + 1))}
            >
              Siguiente →
            </Button>
          </nav>

          {!hasMore && flatProducts.length > 0 ? (
            <Typography variant="muted" className="block text-center text-sm">
              Última página para esta búsqueda.
            </Typography>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
