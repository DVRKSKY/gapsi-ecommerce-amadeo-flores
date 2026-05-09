import Link from "next/link";
import { Badge } from "@/shared/ui/atoms/badge";
import { Typography } from "@/shared/ui/atoms/typography";
import type { ProductDetail } from "@/features/products/models/product-ui.models";
import { ProductGallery } from "@/features/products/ui/molecules/product-gallery";
import { cn } from "@/shared/utils/cn";

export type ProductDetailHeroProps = {
  detail: ProductDetail;
  catalogBackHref: string;
  priorityMainImage?: boolean;
  className?: string;
};

export function ProductDetailHero({
  detail,
  catalogBackHref,
  priorityMainImage,
  className,
}: ProductDetailHeroProps) {
  const badgeSlot =
    typeof detail.availabilityDisplay === "string" && detail.availabilityDisplay.trim().length > 0 ? (
      <Badge tone="accent">{detail.availabilityDisplay}</Badge>
    ) : null;

  return (
    <section className={cn("space-y-4", className)}>
      <Typography
        as={Link}
        href={catalogBackHref}
        variant="muted"
        prefetch={false}
        className="inline-block text-[13px] hover:underline"
      >
        ← Catálogo
      </Typography>

      <ProductGallery
        images={detail.gallery.length ? detail.gallery : [{ url: detail.image.url }]}
        name={detail.name}
        priorityMain={priorityMainImage}
        cornerBadge={badgeSlot}
      />

      {detail.walmartUrl ? (
        <Typography variant="muted" className="text-sm">
          <Link
            href={detail.walmartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-neutral-800 underline-offset-4 hover:underline dark:text-neutral-100"
          >
            Abrir ficha en Walmart.com
          </Link>
        </Typography>
      ) : null}
    </section>
  );
}
