import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

const VARIANTS = {
  display: "scroll-m-20 text-balance font-semibold tracking-tight text-3xl text-neutral-900 md:text-4xl dark:text-neutral-50",
  title:
    "scroll-m-20 text-xl font-semibold tracking-tight text-neutral-900 md:text-2xl dark:text-neutral-50",
  subtitle: "leading-snug text-sm text-neutral-600 md:text-base dark:text-neutral-400",
  body: "text-sm leading-relaxed text-neutral-800 md:text-[15px] dark:text-neutral-200",
  muted: "text-sm leading-relaxed text-neutral-600 md:text-[15px] dark:text-neutral-400",
  label:
    "text-[11px] font-medium uppercase tracking-wide text-neutral-500 md:text-[12px] dark:text-neutral-500",
} as const;

export type TypographyVariant = keyof typeof VARIANTS;

export type TypographyProps<Element extends ElementType = "p"> = {
  as?: Element;
  variant?: TypographyVariant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<Element>, "children" | "className">;

export function Typography<Element extends ElementType = "p">({
  as,
  variant = "body",
  className,
  children,
  ...rest
}: TypographyProps<Element>) {
  const Comp = (as ?? "p") as ElementType;
  return (
    <Comp className={cn(VARIANTS[variant], className)} {...(rest as Record<string, unknown>)}>
      {children}
    </Comp>
  );
}
