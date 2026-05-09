import { Typography } from "@/shared/ui/atoms/typography";
import { cn } from "@/shared/utils/cn";

export type ProductMetaProps = {
  sku: string;
  leadTime?: string;
  className?: string;
};

export function ProductMeta({ sku, leadTime, className }: ProductMetaProps) {
  return (
    <dl
      className={cn(
        "grid gap-2 rounded-2xl border border-neutral-200/80 bg-white/60 p-4 text-sm dark:border-neutral-800/80 dark:bg-neutral-900/40",
        className
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Typography as="dt" variant="label">
          SKU
        </Typography>
        <Typography as="dd" variant="body" className="font-mono text-[13px] text-neutral-800 dark:text-neutral-200">
          {sku}
        </Typography>
      </div>
      {leadTime ? (
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-neutral-200/60 pt-2 dark:border-neutral-800/60">
          <Typography as="dt" variant="label">
            Disponibilidad
          </Typography>
          <Typography as="dd" variant="muted" className="text-right text-[13px] md:text-sm">
            {leadTime}
          </Typography>
        </div>
      ) : null}
    </dl>
  );
}
