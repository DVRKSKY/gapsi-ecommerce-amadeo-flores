import Link from "next/link";
import Image from "next/image";
import { Typography } from "@/shared/ui/atoms/typography";
import type { ShopProductDisplay } from "@/features/products/types";
import { productDetailPath } from "@/features/products/lib/product-detail-route";
import { ProductPrice } from "@/features/products/ui/molecules/product-price";
import { cn } from "@/shared/utils/cn";

export type RelatedProductCardProps = {
  product: ShopProductDisplay;
  preserveCatalogSearch?: string;
  className?: string;
};

export function RelatedProductCard({
  product,
  preserveCatalogSearch,
  className,
}: RelatedProductCardProps) {
  const href = productDetailPath(product.id, preserveCatalogSearch);

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm ring-neutral-900/5 dark:border-neutral-800/80 dark:bg-neutral-950 dark:ring-white/5",
        className,
      )}
    >
      <Link
        href={href}
        prefetch={false}
        className="block outline-offset-2 focus-visible:outline-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-white"
      >
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-900">
          {product.imageSrc ? (
            <Image
              src={product.imageSrc}
              alt={product.name}
              fill
              sizes="240px"
              className="object-contain p-3 md:p-4"
              draggable={false}
            />
          ) : (
            <span className="block size-full bg-gradient-to-br from-neutral-200 via-white to-neutral-200/60 dark:from-neutral-800 dark:via-neutral-950 dark:to-neutral-900" />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          href={href}
          prefetch={false}
          className="rounded-md outline-offset-2 focus-visible:outline-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-white"
        >
          <Typography as="h3" variant="title" className="line-clamp-2 text-base leading-snug hover:underline">
            {product.name}
          </Typography>
        </Link>
        <ProductPrice
          amount={product.price}
          currency={product.currency}
          size="sm"
          unresolved={product.priceUnresolved === true}
        />
        <Link
          href={href}
          prefetch={false}
          className="mt-auto text-[13px] text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-400"
        >
          Ver producto
        </Link>
      </div>
    </article>
  );
}
