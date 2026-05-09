import { ProductCardSkeleton } from "@/features/products/ui/molecules/product-card-skeleton";
import { cn } from "@/shared/utils/cn";

export type ProductsGridSkeletonProps = {
  count?: number;
  className?: string;
};

export function ProductsGridSkeleton({ count = 6, className }: ProductsGridSkeletonProps) {
  const n = Math.max(1, Math.min(count, 12));

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
      aria-hidden
      aria-busy
    >
      {Array.from({ length: n }, (_, idx) => (
        <li key={idx}>
          <ProductCardSkeleton className="h-full" />
        </li>
      ))}
    </ul>
  );
}
