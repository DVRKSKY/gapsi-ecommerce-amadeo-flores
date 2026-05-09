import { Typography } from "@/shared/ui/atoms/typography";
import { formatMoney } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";

export type ProductPriceProps = {
  amount: number;
  currency?: string;
  locale?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function ProductPrice({
  amount,
  currency = "MXN",
  locale = "es-MX",
  size = "md",
  className,
}: ProductPriceProps) {
  const label = formatMoney(amount, locale, currency);
  return (
    <Typography
      as="p"
      variant="body"
      className={cn(
        "font-semibold tabular-nums text-neutral-950 dark:text-white",
        size === "lg" && "text-2xl md:text-3xl",
        size === "md" && "text-xl md:text-2xl",
        size === "sm" && "text-base md:text-lg",
        className
      )}
      aria-label={`Precio ${label}`}
    >
      {label}
    </Typography>
  );
}
