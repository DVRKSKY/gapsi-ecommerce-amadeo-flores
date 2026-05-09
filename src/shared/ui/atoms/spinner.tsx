import type { HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export type SpinnerSize = "sm" | "md" | "lg";

export type SpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  size?: SpinnerSize;
};

const SIZE: Record<SpinnerSize, string> = {
  sm: "size-4 border-[2px]",
  md: "size-5 border-2",
  lg: "size-6 border-[3px]",
};

export function Spinner({ className, size = "md", ...rest }: SpinnerProps) {
  return (
    <span
      aria-live="polite"
      aria-label="Cargando"
      role="status"
      {...rest}
      className={cn(
        SIZE[size],
        "inline-block animate-spin rounded-full border-2 border-solid border-neutral-200 border-t-neutral-900 dark:border-neutral-800 dark:border-t-white",
        className
      )}
    />
  );
}
