import { cn } from "@/shared/utils/cn";

export type ProductCardSkeletonProps = {
  className?: string;
};

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm",
        "dark:border-neutral-800/80 dark:bg-neutral-950",
        className,
      )}
      aria-hidden
    >
      <div className="aspect-[16/10] animate-pulse bg-neutral-100 dark:bg-neutral-900" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="h-5 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-900" />
        <div className="h-4 w-full animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-900" />
        <div className="h-4 w-[92%] max-w-full animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-900" />
        <div className="mt-auto h-10 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900 sm:w-32" />
      </div>
    </div>
  );
}
