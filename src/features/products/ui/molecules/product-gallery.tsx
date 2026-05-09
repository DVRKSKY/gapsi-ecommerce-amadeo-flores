"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import type { ProductImage as GalleryImageModel } from "@/features/products/models/product-ui.models";
import { cn } from "@/shared/utils/cn";

export type ProductGalleryProps = {
  images: readonly GalleryImageModel[];
  name: string;
  priorityMain?: boolean;
  cornerBadge?: ReactNode;
  className?: string;
};

export function ProductGallery({
  images,
  name,
  priorityMain,
  cornerBadge,
  className,
}: ProductGalleryProps) {
  const unique = useMemo(() => dedupe(images), [images]);
  const [active, setActive] = useState(0);

  const main = unique[Math.min(active, Math.max(unique.length - 1, 0))];

  return (
    <div className={cn("flex flex-col gap-3 md:gap-4", className)}>
      <div
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-neutral-200/70 bg-neutral-50",
          "dark:border-neutral-800 dark:bg-neutral-900",
        )}
      >
        {cornerBadge ? (
          <div className="pointer-events-none absolute left-4 top-4 z-10">{cornerBadge}</div>
        ) : null}
        {main?.url.length ? (
          <Image
            src={main.url}
            alt={name}
            fill
            priority={priorityMain}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-6 md:p-8"
            draggable={false}
          />
        ) : (
          <span className="block size-full bg-gradient-to-br from-neutral-200 via-white to-neutral-200/60 dark:from-neutral-800 dark:via-neutral-950 dark:to-neutral-900" />
        )}
      </div>

      {unique.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]" role="tablist">
          {unique.map((img, idx) => (
            <button
              key={`${img.url}-${idx}`}
              type="button"
              aria-label={`Miniatura ${idx + 1}`}
              aria-pressed={idx === active}
              tabIndex={-1}
              className={cn(
                "relative size-14 shrink-0 overflow-hidden rounded-lg border bg-neutral-50 sm:size-16",
                "dark:bg-neutral-900",
                idx === active
                  ? "border-neutral-950 ring-2 ring-neutral-400 dark:border-white dark:ring-neutral-600"
                  : "border-neutral-200/70 dark:border-neutral-800",
              )}
              onClick={() => setActive(idx)}
            >
              {img.url ? (
                <Image src={img.url} alt="" fill sizes="56px" className="object-contain p-1" draggable={false} />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function dedupe(images: readonly GalleryImageModel[]): GalleryImageModel[] {
  const seen = new Set<string>();
  const out: GalleryImageModel[] = [];
  for (const im of images) {
    const u = im.url.trim();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push({ url: u, ...(im.thumbnailUrl ? { thumbnailUrl: im.thumbnailUrl } : {}) });
  }
  return out;
}
