import type { RefObject, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/shared/ui/atoms/badge";
import { buttonClassName } from "@/shared/ui/atoms/button";
import { Typography } from "@/shared/ui/atoms/typography";
import type { ShopProductDisplay } from "@/features/products/types";
import { productDetailPath } from "@/features/products/lib/product-detail-route";
import { formatMoney } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";

export type ProductCardProps =
  | {
      product: ShopProductDisplay;
      className?: string;
      preserveCatalogSearch?: string;
      dragLayout?: undefined;
      dragSurfaceRef?: undefined;
    }
  | {
      product: ShopProductDisplay;
      className?: string;
      preserveCatalogSearch?: string;
      dragLayout: true;
      dragSurfaceRef: RefObject<HTMLDivElement | null>;
    };

const ARTICLE_SHELL = cn(
  "group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm ring-neutral-900/5 ring-inset transition-[box-shadow,border-color]",
  "dark:border-neutral-800/80 dark:bg-neutral-950 dark:ring-white/5",
);

export function ProductCard(props: ProductCardProps) {
  const dragLayout = "dragLayout" in props && props.dragLayout === true;
  const { product, className, preserveCatalogSearch } = props;
  const href = productDetailPath(product.id, preserveCatalogSearch);
  const subtitle = product.subtitle?.trim();
  const priceLabel = formatMoney(product.price, "en-US", product.currency ?? "USD");

  const sharedImageWrap = cn(
    "relative block aspect-[16/10] w-full overflow-hidden bg-neutral-100 outline-offset-2",
    dragLayout ? "" : "focus-visible:outline-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-white",
    "dark:bg-neutral-900",
  );

  const imageInner = (
    <>
      {product.imageSrc ? (
        <Image
          src={product.imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="bg-neutral-50 object-contain p-6 dark:bg-neutral-900"
          priority={false}
          draggable={false}
        />
      ) : (
        <span
          aria-hidden
          className="block size-full bg-gradient-to-br from-neutral-200 via-white to-neutral-200/40 dark:from-neutral-800 dark:via-neutral-950 dark:to-neutral-900"
        />
      )}
      {product.badge ? (
        <span className="pointer-events-none absolute top-3 left-3 z-10">
          <Badge tone="accent">{product.badge}</Badge>
        </span>
      ) : null}
    </>
  );

  const shell = (children: ReactNode) => (
    <article className={cn(ARTICLE_SHELL, dragLayout && "h-full min-h-0", className)}>{children}</article>
  );

  const linkPrefetch = { prefetch: false as const };

  if (dragLayout) {
    const { dragSurfaceRef } = props;
    return shell(
      <>
        <div
          ref={dragSurfaceRef}
          className={cn(
            "flex min-h-0 flex-1 touch-manipulation flex-col select-none",
            "cursor-grab active:cursor-grabbing",
          )}
        >
          <div className="relative">
            <div className={sharedImageWrap}>{imageInner}</div>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <Typography as="h3" variant="title" className="truncate text-base md:text-lg">
                  {product.name}
                </Typography>
                {subtitle ? (
                  <Typography variant="subtitle" className="line-clamp-2">
                    {subtitle}
                  </Typography>
                ) : null}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <Typography variant="label" className="text-neutral-600 dark:text-neutral-300">
                Precio
              </Typography>
              <Typography
                as="div"
                variant="body"
                className="text-lg font-semibold tabular-nums text-neutral-950 dark:text-white"
              >
                {priceLabel}
              </Typography>
            </div>
          </div>
        </div>

        <div className="relative z-20 shrink-0 border-t border-neutral-200/80 bg-white px-4 py-4 dark:border-neutral-800/80 dark:bg-neutral-950">
          <Link
            className={buttonClassName({
              variant: "outline",
              size: "sm",
              className: "relative z-30 w-full justify-center text-center sm:w-auto",
            })}
            href={href}
            {...linkPrefetch}
          >
            Ver detalle
          </Link>
        </div>
      </>,
    );
  }

  return shell(
    <>
      <div className="relative">
        <Link
          aria-label={`Abrir detalle de ${product.name}`}
          className={sharedImageWrap}
          href={href}
          {...linkPrefetch}
        >
          {imageInner}
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <Typography as="h3" variant="title" className="truncate text-base md:text-lg">
              <Link href={href} {...linkPrefetch} className="rounded-sm hover:underline">
                {product.name}
              </Link>
            </Typography>
            {subtitle ? (
              <Typography variant="subtitle" className="line-clamp-2">
                {subtitle}
              </Typography>
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Typography variant="label" className="text-neutral-600 dark:text-neutral-300">
            Precio
          </Typography>
          <Typography
            as="div"
            variant="body"
            className="text-lg font-semibold tabular-nums text-neutral-950 dark:text-white"
          >
            {priceLabel}
          </Typography>
        </div>

        <Link
          className={buttonClassName({
            variant: "outline",
            size: "sm",
            className: "w-full justify-center text-center sm:w-auto",
          })}
          href={href}
          {...linkPrefetch}
        >
          Ver detalle
        </Link>
      </div>
    </>,
  );
}
