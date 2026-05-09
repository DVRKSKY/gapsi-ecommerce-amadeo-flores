import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-950/40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:focus-visible:ring-white/30",
  secondary:
    "bg-neutral-100 text-neutral-900 hover:bg-neutral-200/70 focus-visible:ring-neutral-400/35 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-700 dark:focus-visible:ring-neutral-600/35",
  outline:
    "border border-neutral-200 bg-transparent hover:bg-neutral-50 focus-visible:ring-neutral-400/35 dark:border-neutral-800 dark:hover:bg-neutral-950",
  ghost:
    "bg-transparent hover:bg-neutral-100 focus-visible:ring-neutral-400/35 dark:hover:bg-neutral-900",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40 dark:focus-visible:ring-red-600/35",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1 px-3 text-[13px] leading-none",
  md: "h-10 gap-2 px-3.5 text-sm leading-none md:px-4",
  lg: "h-11 gap-2 px-4 text-[15px] leading-none md:px-5",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: Pick<ButtonProps, "variant" | "size"> & { className?: string }) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-xl font-medium whitespace-nowrap transition-colors focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, type = "button", variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
});
