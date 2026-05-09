import { Typography } from "@/shared/ui/atoms/typography";
import type { ShopProductDisplay } from "@/features/products/types";
import { DraggableProductsGrid } from "@/features/products/ui/organisms/draggable-products-grid";
import { cn } from "@/shared/utils/cn";

export type ProductsSectionProps = {
  title: string;
  description?: string;
  products: ShopProductDisplay[];
  className?: string;
};

export function ProductsSection({ title, description, products, className }: ProductsSectionProps) {
  return (
    <section className={cn("space-y-6", className)} aria-labelledby="catalogo-titulo">
      <div className="space-y-3">
        <Typography as="h2" id="catalogo-titulo" variant="display" className="text-balance">
          {title}
        </Typography>
        {description ? (
          <Typography variant="subtitle" className="max-w-2xl text-pretty">
            {description}
          </Typography>
        ) : null}
      </div>

      <DraggableProductsGrid products={products} />
    </section>
  );
}
