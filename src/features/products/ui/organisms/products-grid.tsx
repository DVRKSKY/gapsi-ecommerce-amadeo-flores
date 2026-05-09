import { ProductCard } from "@/features/products/ui/molecules/product-card";
import type { ShopProductDisplay } from "@/features/products/types";
import { cn } from "@/shared/utils/cn";

export type ProductsGridProps = {
  products: ShopProductDisplay[];
  preserveCatalogSearch?: string;
  className?: string;
};

export function ProductsGrid({ products, preserveCatalogSearch, className }: ProductsGridProps) {
  return (
    <ul className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            preserveCatalogSearch={preserveCatalogSearch}
            className="h-full"
          />
        </li>
      ))}
    </ul>
  );
}
