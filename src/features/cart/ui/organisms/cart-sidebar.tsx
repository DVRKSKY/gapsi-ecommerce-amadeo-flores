"use client";

import type { CSSProperties } from "react";
import { useCallback } from "react";
import { useCartStore } from "@/features/cart/stores/cart-store";
import { Badge } from "@/shared/ui/atoms/badge";
import { Button } from "@/shared/ui/atoms/button";
import { Typography } from "@/shared/ui/atoms/typography";
import { CartItem } from "@/features/cart/ui/molecules/cart-item";
import { formatMoney } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";

export type CartSidebarProps = {
  headerOffsetPx: number;
  currency?: string;
  className?: string;
};

export function CartSidebar({ headerOffsetPx, currency = "MXN", className }: CartSidebarProps) {
  const lines = useCartStore((s) => s.lines);
  const registerDropZone = useCartStore((s) => s.registerDropZone);
  const dropHovered = useCartStore((s) => s.ui.dropZoneHovered);
  const draggingId = useCartStore((s) => s.ui.draggingProductId);

  const attachDropZone = useCallback(
    (node: HTMLElement | null) => {
      registerDropZone(node);
    },
    [registerDropZone],
  );

  const quantity = lines.reduce((acc, line) => acc + line.quantity, 0);
  const amount = lines.reduce((acc, line) => acc + line.price * line.quantity, 0);
  const totalLabel = formatMoney(amount, "es-MX", currency);

  const dropAccent = draggingId !== null && dropHovered;
  const showDropHint = draggingId !== null;

  const offset = Math.max(0, Math.round(headerOffsetPx));

  const asideStyle: CSSProperties = {
    top: offset,
    bottom: 0,
    height: "auto",
  };

  return (
    <aside
        id="panel-carrito"
        ref={attachDropZone}
        tabIndex={-1}
        aria-label="Carrito"
        style={asideStyle}
        className={cn(
          "fixed right-0 z-50 flex w-full max-w-sm min-w-0 translate-x-0 flex-col overflow-hidden border-l border-neutral-200/80 bg-neutral-50 shadow-xl dark:border-neutral-800/80 dark:bg-neutral-950",
          showDropHint &&
            cn(
              "ring-2 ring-inset ring-amber-400/80 shadow-lg dark:ring-amber-500/70",
              dropAccent && "ring-amber-500 ring-offset-0 dark:ring-amber-400",
            ),
          className,
        )}
      >
        {showDropHint ? (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 z-[1] transition-[background-color] duration-200",
              dropAccent ? "bg-amber-400/45 dark:bg-amber-500/35" : "bg-amber-300/25 dark:bg-amber-500/20",
            )}
          />
        ) : null}

        <div className="relative z-[2] flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200/70 px-3 py-2.5 dark:border-neutral-900/70">
          <Typography variant="title" className="text-lg tracking-tight">
            Carrito
          </Typography>
          {quantity > 0 ? (
            <Badge tone="neutral" className="tabular-nums">
              {quantity}
            </Badge>
          ) : null}
        </div>

        <div className="relative z-[2] flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-2">
            {lines.length === 0 ? (
              <div className="flex min-h-[30vh] items-center justify-center py-10">
                <Typography variant="muted" className="text-center text-sm">
                  Vacío.
                </Typography>
              </div>
            ) : (
              <ul className="space-y-2" aria-label="Productos en el carrito">
                {lines.map((line) => (
                  <li key={line.id}>
                    <CartItem line={line} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative z-[2] shrink-0 border-t border-neutral-200/70 bg-white/95 px-3 py-3 backdrop-blur-md dark:border-neutral-900/70 dark:bg-neutral-950/95">
            <div className="flex items-end justify-between gap-3">
              <Typography variant="label">Total estimado</Typography>
              <Typography as="div" variant="title" className="text-xl tabular-nums lg:text-2xl">
                {totalLabel}
              </Typography>
            </div>
            <Button type="button" variant="primary" size="lg" className="mt-3 w-full" disabled>
              Finalizar compra
            </Button>
          </div>
        </div>
    </aside>
  );
}
