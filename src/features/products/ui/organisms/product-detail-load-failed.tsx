import Link from "next/link";
import { buttonClassName } from "@/shared/ui/atoms/button";
import { Typography } from "@/shared/ui/atoms/typography";
import { ResponsiveContainer } from "@/shared/ui/layout/responsive-container";

export type ProductDetailLoadFailedProps = {
  message: string;
  backHref: string;
};

export function ProductDetailLoadFailed({ message, backHref }: ProductDetailLoadFailedProps) {
  return (
    <ResponsiveContainer className="py-12">
      <section className="mx-auto max-w-lg space-y-4">
        <Typography as="h1" variant="display" className="text-balance">
          No se pudo cargar el producto
        </Typography>
        <Typography variant="body" className="text-pretty text-neutral-600 dark:text-neutral-400">
          {message}
        </Typography>
        <div className="pt-2">
          <Link href={backHref} className={buttonClassName({ variant: "outline", size: "md" })}>
            Volver al catálogo
          </Link>
        </div>
      </section>
    </ResponsiveContainer>
  );
}
