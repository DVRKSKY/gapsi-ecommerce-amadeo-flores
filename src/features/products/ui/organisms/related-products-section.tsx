import { Typography } from "@/shared/ui/atoms/typography";
import type { ShopProductDisplay } from "@/features/products/types";
import { RelatedProductCard } from "@/features/products/ui/molecules/related-product-card";
import { cn } from "@/shared/utils/cn";

export type RelatedProductsSectionProps = {
  items: ShopProductDisplay[];
  preserveCatalogSearch?: string;
  className?: string;
};

export function RelatedProductsSection({
  items,
  preserveCatalogSearch,
  className,
}: RelatedProductsSectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={cn(
        "space-y-6 border-t border-neutral-200/80 pt-12 dark:border-neutral-800/80",
        className,
      )}
      aria-labelledby="related-heading"
    >
      <Typography as="h2" id="related-heading" variant="title">
        También podría interesarte
      </Typography>

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((product) => (
          <li key={product.id}>
            <RelatedProductCard
              product={product}
              preserveCatalogSearch={preserveCatalogSearch}
              className="h-full"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
