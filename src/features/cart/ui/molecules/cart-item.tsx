"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/shared/ui/atoms/button";
import { Typography } from "@/shared/ui/atoms/typography";
import type { CartLineDisplay } from "@/features/cart/types";
import { animateCartLineExit } from "@/features/cart/lib/animate-cart-line-exit";
import { useRemoveCartLine } from "@/features/cart/hooks/use-remove-cart-line";
import { formatMoney } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";

function TrashIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-4">
      <path
        className="stroke-current"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 1.75h6A2 2 0 0 0 17 19l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
      />
    </svg>
  );
}

export type CartItemProps = {
  line: CartLineDisplay;
  className?: string;
};

export function CartItem({ line, className }: CartItemProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const removeLineById = useRemoveCartLine();
  const [exiting, setExiting] = useState(false);

  const currency = line.currency ?? "MXN";
  const unit = formatMoney(line.price, "es-MX", currency);
  const subtotalValue = formatMoney(line.price * line.quantity, "es-MX", currency);

  const handleRemove = async () => {
    if (exiting) return;
    const el = rootRef.current;
    if (!el) {
      removeLineById(line.id);
      return;
    }
    setExiting(true);
    try {
      await animateCartLineExit(el);
    } finally {
      removeLineById(line.id);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex gap-2 rounded-xl border border-neutral-200/80 bg-white p-2 shadow-sm ring-neutral-900/5 will-change-transform",
        "dark:border-neutral-800/80 dark:bg-neutral-950 dark:ring-white/5",
        exiting && "pointer-events-none",
        className,
      )}
    >
      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-neutral-200/70 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        {line.imageSrc ? (
          <Image src={line.imageSrc} alt={line.name} fill sizes="44px" className="object-contain p-1" />
        ) : (
          <span className="sr-only">{line.name}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <Typography
            as="h3"
            variant="subtitle"
            className="min-w-0 flex-1 truncate text-[13px] leading-snug font-medium md:text-sm"
          >
            {line.name}
          </Typography>
          <span className="shrink-0 text-[11px] font-medium tabular-nums text-neutral-500 dark:text-neutral-400 md:text-xs">
            ×{line.quantity}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <Typography variant="muted" className="line-clamp-1 min-w-0 flex-1 text-[11px] tabular-nums md:text-xs">
            {unit} × {line.quantity} · <span className="font-semibold text-neutral-800 dark:text-neutral-100">{subtotalValue}</span>
          </Typography>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-my-1 size-8 shrink-0 rounded-lg p-0 text-neutral-500 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            aria-busy={exiting}
            disabled={exiting}
            title="Quitar"
            aria-label={`Quitar ${line.name} del carrito`}
            onClick={() => void handleRemove()}
          >
            {exiting ? <span className="text-xs tabular-nums">…</span> : <TrashIcon />}
          </Button>
        </div>
      </div>
    </div>
  );
}
