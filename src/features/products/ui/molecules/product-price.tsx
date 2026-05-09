import { Typography } from "@/shared/ui/atoms/typography";
import { formatMoney } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";

export type ProductPriceProps = {
  amount: number;
  currency?: string;
  locale?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Sin precio fiable en el payload de la API */
  unresolved?: boolean;
};

export function ProductPrice({
  amount,
  currency = "MXN",
  locale = "es-MX",
  size = "md",
  className,
  unresolved = false,
}: ProductPriceProps) {
  const label = unresolved ? "No disponible" : formatMoney(amount, locale, currency);
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
      aria-label={unresolved ? "Precio no disponible" : `Precio ${label}`}
    >
      {label}
    </Typography>
  );
}
