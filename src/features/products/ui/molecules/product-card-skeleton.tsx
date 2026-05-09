import { cn } from "@/shared/utils/cn";

export type ProductCardSkeletonProps = {
  className?: string;
};

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-sm",
        "dark:border-neutral-800/80 dark:bg-neutral-900",
        className,
      )}
      aria-hidden
    >
      <div className="aspect-[16/10] animate-pulse bg-neutral-300/90 dark:bg-neutral-700/90" />
      <div className="flex flex-1 flex-col gap-4 bg-white p-4 dark:bg-neutral-950">
        <div className="h-5 animate-pulse rounded-md bg-neutral-300/95 dark:bg-neutral-700/90" />
        <div className="h-4 w-full animate-pulse rounded-md bg-neutral-200/95 dark:bg-neutral-800/90" />
        <div className="h-4 w-[92%] max-w-full animate-pulse rounded-md bg-neutral-200/95 dark:bg-neutral-800/90" />
        <div className="mt-auto h-10 w-full animate-pulse rounded-xl bg-neutral-300/95 dark:bg-neutral-700 sm:w-32" />
      </div>
    </div>
  );
}
