"use client";

import type { ReactNode } from "react";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CartSidebar } from "@/features/cart";
import { useCartStore } from "@/features/cart";
import { ShopHeader } from "@/features/products";
import { cn } from "@/shared/utils/cn";

const STORE_HEADER_FALLBACK_PX = 152;

export type StoreShellProps = {
  children: ReactNode;
  className?: string;
};

export function StoreShell({ children, className }: StoreShellProps) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [headerOffsetPx, setHeaderOffsetPx] = useState(STORE_HEADER_FALLBACK_PX);

  useEffect(() => {
    useCartStore.getState().setMobileDrawerOpen(false);
  }, [pathname]);

  useLayoutEffect(() => {
    const node = headerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      const h = Math.ceil(node.getBoundingClientRect().height);
      if (h > 0) setHeaderOffsetPx(h);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50",
        className,
      )}
    >
      <Suspense fallback={<div className="h-[152px] shrink-0 border-b border-neutral-200/70 bg-white/90 dark:border-neutral-900/70 dark:bg-neutral-950/80" aria-hidden />}>
        <ShopHeader ref={headerRef} />
      </Suspense>

      <div
        id="tienda-workspace"
        className="relative flex min-h-0 min-w-0 flex-1 flex-col"
      >
        <main
          id="contenido-tienda"
          className="relative min-h-0 w-full min-w-0 max-w-full flex-1 overflow-y-auto overflow-x-hidden [overflow-anchor:none] lg:pr-96"
        >
          {children}
        </main>
      </div>

      <CartSidebar headerOffsetPx={headerOffsetPx} />
    </div>
  );
}
