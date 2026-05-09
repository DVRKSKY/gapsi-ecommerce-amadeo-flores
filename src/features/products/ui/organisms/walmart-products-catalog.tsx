"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { HttpError } from "@/shared/api/errors";
import { routes } from "@/shared/constants/routes";
import { Typography } from "@/shared/ui/atoms/typography";
import { SUGGESTED_PRODUCT_QUERIES } from "../../constants/search-ui";
import { previewToShopProductDisplay } from "../../factories/walmart-product.factory";
import { useProductsQuery } from "../../hooks/use-products-query";
import type { ShopProductDisplay } from "../../types";
import { ProductsGrid } from "./products-grid";
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

  const { data, isPending, isFetching, isError, error, refetch, fetchStatus } = useProductsQuery({
    search: searchTerm,
    page: 1,
    enabled: searchTerm.length > 0,
  });

  const products: ShopProductDisplay[] = data?.products.map(previewToShopProductDisplay) ?? [];

  const showInitialHints = searchTerm.length === 0;
  const showEmptyResult =
    !isPending && !isError && searchTerm.length > 0 && products.length === 0;

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
            Revisa la pestaña Network por la llamada a <code className="rounded bg-neutral-200/70 px-1 dark:bg-neutral-800">/api/products?search=…</code>
            y tu <code className="rounded bg-neutral-200/70 px-1 dark:bg-neutral-800">.env.local</code>
            con RapidAPI.
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

      {!isPending && products.length > 0 ? (
        <div className="space-y-2">
          {isFetching ? (
            <Typography variant="muted" className="text-sm">
              Actualizando…
            </Typography>
          ) : null}
          <ProductsGrid products={products} preserveCatalogSearch={searchTerm} />
        </div>
      ) : null}
    </section>
  );
}
