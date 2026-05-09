import Link from "next/link";
import { Typography } from "@/shared/ui/atoms/typography";
import type { ProductDetail } from "@/features/products/models/product-ui.models";
import { productDetailPath } from "@/features/products/lib/product-detail-route";
import { ProductAddToCartButton } from "@/features/products/ui/molecules/product-add-to-cart-button";
import { ProductPrice } from "@/features/products/ui/molecules/product-price";
import type { ShopProductDisplay } from "@/features/products/types";
import { cn } from "@/shared/utils/cn";

export type ProductInfoPanelProps = {
  detail: ProductDetail;
  cartProduct: ShopProductDisplay;
  preserveCatalogSearch?: string;
  className?: string;
};

export function ProductInfoPanel({
  detail,
  cartProduct,
  preserveCatalogSearch,
  className,
}: ProductInfoPanelProps) {
  const subtitle = detail.shortDescription?.trim();
  const ratingLabel =
    detail.averageRating !== null && detail.numberOfReviews !== null
      ? `${detail.averageRating.toFixed(1)} · ${detail.numberOfReviews.toLocaleString("es-MX")} reseñas`
      : detail.averageRating !== null
        ? `${detail.averageRating.toFixed(1)} estrellas`
        : null;

  return (
    <aside className={className}>
      <div className="space-y-6">
        <header className="space-y-3">
          <Typography
            as="h1"
            id="producto-detalle-nombre"
            variant="display"
            className="text-balance text-3xl md:text-4xl"
          >
            {detail.name}
          </Typography>
          {subtitle ? (
            <Typography variant="subtitle" className="max-w-xl text-pretty">
              {subtitle}
            </Typography>
          ) : null}
        </header>

        <dl
          className={cn(
            "grid gap-3 rounded-2xl border border-neutral-200/80 bg-white/60 p-4 text-sm",
            "dark:border-neutral-800/80 dark:bg-neutral-900/40",
          )}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Typography as="dt" variant="label">
              ID artículo
            </Typography>
            <Typography as="dd" variant="body" className="font-mono text-[13px] text-neutral-800 dark:text-neutral-200">
              {detail.id}
            </Typography>
          </div>
          {detail.sellerName ? (
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-neutral-200/60 pt-3 dark:border-neutral-800/60">
              <Typography as="dt" variant="label">
                Vendedor
              </Typography>
              <Typography as="dd" variant="body" className="max-w-[70%] text-right text-[13px]">
                {detail.sellerName}
              </Typography>
            </div>
          ) : null}
          {detail.brandText ? (
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-neutral-200/60 pt-3 dark:border-neutral-800/60">
              <Typography as="dt" variant="label">
                Marca
              </Typography>
              <Typography as="dd" variant="body" className="text-right text-[13px]">
                {detail.brandText}
              </Typography>
            </div>
          ) : null}
          {detail.categoryText ? (
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-neutral-200/60 pt-3 dark:border-neutral-800/60">
              <Typography as="dt" variant="label">
                Categoría
              </Typography>
              <Typography as="dd" variant="body" className="text-right text-[13px]">
                {detail.categoryText}
              </Typography>
            </div>
          ) : null}
          {ratingLabel ? (
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-neutral-200/60 pt-3 dark:border-neutral-800/60">
              <Typography as="dt" variant="label">
                Valoración
              </Typography>
              <Typography as="dd" variant="body" className="text-right text-[13px] tabular-nums">
                {ratingLabel}
              </Typography>
            </div>
          ) : null}
          {detail.availabilityDisplay ? (
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-neutral-200/60 pt-3 dark:border-neutral-800/60">
              <Typography as="dt" variant="label">
                Disponibilidad
              </Typography>
              <Typography as="dd" variant="muted" className="text-right text-[13px]">
                {detail.availabilityDisplay}
              </Typography>
            </div>
          ) : null}
        </dl>

        <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-neutral-200/70 bg-white/70 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/35">
          <Typography variant="label">Precio</Typography>
          <ProductPrice
            amount={detail.price}
            currency={detail.currency}
            size="lg"
            unresolved={detail.priceUnresolved === true}
          />
        </div>

        {detail.variants.length > 0 ? (
          <div className="space-y-2">
            <Typography variant="label">Variantes</Typography>
            <ul className="flex flex-wrap gap-2">
              {detail.variants.map((v) => (
                <li key={v.id}>
                  <Link
                    href={productDetailPath(v.id, preserveCatalogSearch)}
                    prefetch={false}
                    className="inline-flex max-w-full items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-800 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-600"
                  >
                    <span className="truncate">{v.name}</span>
                    {v.price !== null ? (
                      <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
                        ${v.price.toFixed(2)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-2">
          <Typography variant="label">Descripción</Typography>
          <Typography variant="body" className="max-w-xl text-pretty whitespace-pre-line">
            {detail.longDescription ?? detail.shortDescription ?? "Sin descripción."}
          </Typography>
        </div>

        <ProductAddToCartButton product={cartProduct} className="w-full sm:max-w-sm" />
      </div>
    </aside>
  );
}
