import Image from "next/image";
import Link from "next/link";
import { AUTHOR_LINKEDIN_URL } from "@/shared/constants/app";
import { routes } from "@/shared/constants/routes";
import { ResponsiveContainer } from "@/shared/ui/layout/responsive-container";
import { cn } from "@/shared/utils/cn";

export type SiteFooterProps = {
  className?: string;
};

const year = new Date().getFullYear();

export function SiteFooter({ className }: SiteFooterProps) {
  const linkedIn = AUTHOR_LINKEDIN_URL.length > 0 ? AUTHOR_LINKEDIN_URL : undefined;

  return (
    <footer
      role="contentinfo"
      className={cn(
        "border-t border-neutral-200/90 bg-neutral-50/90 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950/98 dark:text-neutral-300",
        className,
      )}
    >
      <ResponsiveContainer className="py-10 text-left md:py-14 lg:pr-96">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-14">
          <div className="min-w-0 max-w-xl">
            <Link
              href={routes.home}
              className="inline-block rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-white"
              aria-label="Ir al catálogo (inicio redirige al catálogo)"
            >
              <Image
                src="/logo.png"
                alt="Gapsi Ecommerce"
                width={200}
                height={48}
                className="h-9 max-h-10 w-auto max-w-[220px] object-contain object-left md:h-10"
              />
            </Link>
            <p className="mt-4 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400 md:text-sm">
              Catálogo, búsqueda y carrito en un flujo ligero pensado como demo técnica.
            </p>
          </div>

          <nav aria-label="Pie de página" className="md:min-w-[12rem]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-500">
              Enlaces
            </p>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm">
              <li>
                <Link
                  href={routes.products}
                  prefetch={false}
                  className="text-neutral-700 transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                >
                  Catálogo
                </Link>
              </li>
              <li>
                {linkedIn ? (
                  <a
                    href={linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-700 transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                  >
                    LinkedIn
                  </a>
                ) : (
                  <span
                    className="text-neutral-500 dark:text-neutral-500"
                    title="Define NEXT_PUBLIC_LINKEDIN_URL en .env.local con tu perfil público"
                  >
                    LinkedIn
                  </span>
                )}
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 space-y-2 border-t border-neutral-200/80 pt-6 text-[11px] text-neutral-500 dark:border-neutral-800/90 dark:text-neutral-500 md:mt-12 md:text-xs">
          <p>© {year} Gapsi Ecommerce. Todos los derechos reservados.</p>
          <p>
            Proyecto por <span className="font-medium text-neutral-700 dark:text-neutral-300">Amadeo Flores</span>.
          </p>
          <p>Construido con Next.js para evaluación técnica.</p>
        </div>
      </ResponsiveContainer>
    </footer>
  );
}
