import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type BadgeTone = "neutral" | "muted" | "accent" | "destructive";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  tone?: BadgeTone;
  children: ReactNode;
};

const TONE: Record<BadgeTone, string> = {
  neutral:
    "border-transparent bg-neutral-900 text-neutral-50 dark:bg-white dark:text-neutral-950 dark:ring-transparent",
  muted:
    "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200",
  accent:
    "border-transparent bg-sky-600 text-white shadow-sm shadow-sky-600/25 dark:bg-sky-500 dark:text-white dark:shadow-sky-500/35",
  destructive:
    "border-transparent bg-red-600 text-white dark:bg-red-600 dark:text-white",
};

export function Badge({ tone = "muted", className, children, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      className={cn(
        "inline-flex max-w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset ring-transparent md:text-[12px]",
        TONE[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
