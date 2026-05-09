"use client";

import { forwardRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/features/cart";
import { Badge } from "@/shared/ui/atoms/badge";
import { Button } from "@/shared/ui/atoms/button";
import { Typography } from "@/shared/ui/atoms/typography";
import { ResponsiveContainer } from "@/shared/ui/layout/responsive-container";
import { routes } from "@/shared/constants/routes";
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

  const qty = useCartStore((s) => s.lines.reduce((acc, l) => acc + l.quantity, 0));
  const drawerOpen = useCartStore((s) => s.mobileDrawerOpen);
  const toggleDrawer = useCartStore((s) => s.toggleMobileDrawerOpen);

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
      <ResponsiveContainer className="py-4 text-left lg:pr-96">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-2">
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

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="relative ml-auto gap-2 rounded-xl lg:hidden"
            aria-label="Ver carrito"
            aria-expanded={drawerOpen}
            aria-controls="panel-carrito"
            onClick={toggleDrawer}
          >
            <span className="inline-flex shrink-0" aria-hidden>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-neutral-800 dark:text-neutral-100"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              Carrito
            </span>
            {qty > 0 ? (
              <Badge tone="neutral" className="ml-0 min-w-[1.75rem] justify-center px-2 tabular-nums text-xs">
                {qty}
              </Badge>
            ) : null}
          </Button>
        </div>
      </ResponsiveContainer>

      <div className="border-t border-neutral-200/70 bg-white/95 dark:border-neutral-900/70 dark:bg-neutral-950/90">
        <ResponsiveContainer className="pb-4 pt-3 text-left lg:pr-96">
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
