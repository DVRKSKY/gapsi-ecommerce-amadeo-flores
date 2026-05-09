"use client";

import { forwardRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/shared/constants/routes";
import { Typography } from "@/shared/ui/atoms/typography";
import { ResponsiveContainer } from "@/shared/ui/layout/responsive-container";
import { SearchBar } from "@/features/products/ui/molecules/search-bar";
import { cn } from "@/shared/utils/cn";

export type ShopHeaderProps = {
  brandLabel?: string;
  brandHref?: string;
  className?: string;
};

export const ShopHeader = forwardRef<HTMLElement, ShopHeaderProps>(function ShopHeader(
  { brandHref = "/", brandLabel = "Gapsi", className },
  ref,
) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const isCatalog = pathname === routes.products;
  const urlSearch = isCatalog ? (sp.get("search") ?? "") : "";
  const searchBarKey =
    pathname + (isCatalog ? `:${urlSearch.length ? encodeURIComponent(urlSearch) : "_"}` : "");

  function navigateToCatalogSearch(trimmedTerm: string) {
    const path = routes.catalogWithSearch(trimmedTerm);
    if (isCatalog) {
      router.replace(path);
      return;
    }
    router.push(path);
  }

  return (
    <header
      ref={ref}
      className={cn(
        "sticky top-0 z-40 border-b border-neutral-200/70 bg-white/90 backdrop-blur-md dark:border-neutral-900/70 dark:bg-neutral-950/80",
        className,
      )}
    >
      <ResponsiveContainer className="py-4 text-left md:pr-96">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              aria-label={`Ir al inicio — ${brandLabel}`}
              href={brandHref}
              className={cn(
                "rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-white",
              )}
            >
              <Image
                src="/logo.png"
                alt={brandLabel}
                width={200}
                height={48}
                priority
                className="h-8 max-h-9 w-auto max-w-[min(220px,50vw)] object-contain object-left md:h-9"
              />
            </Link>

            <nav aria-label="Principal" className="flex shrink-0 items-center gap-4 text-[13px] font-medium md:text-sm">
              <Typography
                as={Link}
                href={routes.products}
                variant="body"
                prefetch={false}
                className="text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
              >
                Catálogo
              </Typography>
            </nav>
          </div>
        </div>
      </ResponsiveContainer>

      <div className="border-t border-neutral-200/70 bg-white/95 dark:border-neutral-900/70 dark:bg-neutral-950/90">
        <ResponsiveContainer className="pb-4 pt-3 text-left md:pr-96">
          <SearchBar
            key={searchBarKey}
            className="w-full max-w-none"
            placeholder="Buscar productos…"
            defaultValue={isCatalog ? urlSearch : ""}
            onSearch={(term) => navigateToCatalogSearch(term.trim())}
          />
        </ResponsiveContainer>
      </div>
    </header>
  );
});
