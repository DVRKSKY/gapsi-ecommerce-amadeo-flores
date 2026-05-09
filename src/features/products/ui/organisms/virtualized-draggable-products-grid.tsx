"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CellComponentProps } from "react-window";
import { Grid, useGridRef } from "react-window";
import {
  CATALOG_VIRTUAL_GAP,
  CATALOG_VIRTUAL_ROW_HEIGHT,
  CATALOG_GRID_SCROLL_MAX_H,
  CATALOG_GRID_SCROLL_MIN_H,
} from "../../constants/catalog-virtual-grid";
import type { ShopProductDisplay } from "../../types";
import { DraggableProductCard } from "../molecules/draggable-product-card";
import { cn } from "@/shared/utils/cn";

type CatalogCellPayload = {
  products: readonly ShopProductDisplay[];
  columnCount: number;
  preserveCatalogSearch?: string;
};

function columnsFor(width: number): number {
  if (width <= 0) return 3;
  if (width >= 1280) return 3;
  if (width >= 640) return 2;
  return 1;
}

function insetCellStyle(style: CSSProperties): CSSProperties {
  const pad = CATALOG_VIRTUAL_GAP / 2;
  const left = Number(style.left) + pad;
  const top = Number(style.top) + pad;
  const width = Math.max(0, Number(style.width) - CATALOG_VIRTUAL_GAP);
  const height = Math.max(0, Number(style.height) - CATALOG_VIRTUAL_GAP);
  return {
    ...style,
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    maxWidth: "100%",
    boxSizing: "border-box",
  };
}

function VirtualCatalogCell(props: CellComponentProps<CatalogCellPayload>): ReactElement | null {
  const { ariaAttributes, columnIndex, rowIndex, style, products, columnCount, preserveCatalogSearch } =
    props;
  const idx = rowIndex * columnCount + columnIndex;
  const innerStyle = insetCellStyle(style);

  if (idx >= products.length) {
    return (
      <div {...ariaAttributes} style={innerStyle} className="rounded-2xl bg-transparent" aria-hidden />
    );
  }

  const product = products[idx];
  return (
    <div {...ariaAttributes} style={innerStyle} className="min-h-0 min-w-0 max-w-full overflow-hidden">
      <DraggableProductCard
        product={product}
        preserveCatalogSearch={preserveCatalogSearch}
        className="min-h-0"
      />
    </div>
  );
}

export type VirtualizedDraggableProductsGridProps = {
  products: readonly ShopProductDisplay[];
  preserveCatalogSearch?: string;
  className?: string;
  /** Llamado cuando el usuario se acerca al final visible del grid (scroll interno). */
  onNearEnd?: () => void;
};

export function VirtualizedDraggableProductsGrid({
  products,
  preserveCatalogSearch,
  className,
  onNearEnd,
}: VirtualizedDraggableProductsGridProps): ReactNode {
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 0, h: CATALOG_GRID_SCROLL_MIN_H });
  const gridRef = useGridRef(null);
  const onNearEndRef = useRef(onNearEnd);

  useLayoutEffect(() => {
    onNearEndRef.current = onNearEnd;
  }, [onNearEnd]);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      setDims({
        w: Math.floor(el.clientWidth),
        h: Math.max(CATALOG_GRID_SCROLL_MIN_H, Math.floor(el.clientHeight)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const columnCount = useMemo(() => columnsFor(dims.w), [dims.w]);
  const columnWidth =
    dims.w > 0 && columnCount > 0 ? Math.floor(dims.w / columnCount) : Math.max(dims.w, 320);

  const rowCount = Math.max(1, Math.ceil(products.length / columnCount));

  const cellProps = useMemo(
    (): CatalogCellPayload => ({
      products,
      columnCount,
      preserveCatalogSearch,
    }),
    [products, columnCount, preserveCatalogSearch],
  );

  const handleCellsRendered = useCallback(
    (visible: { rowStopIndex: number }) => {
      if (!onNearEndRef.current) return;
      if (products.length === 0) return;
      const prefetchFrom = Math.max(0, rowCount - 2);
      if (visible.rowStopIndex >= prefetchFrom) {
        onNearEndRef.current();
      }
    },
    [products.length, rowCount],
  );

  if (products.length === 0) return null;

  return (
    <div
      ref={measureRef}
      className={cn("w-full min-w-0 max-w-full shrink-0 overflow-x-hidden", className)}
      style={{
        height: `min(72vh, ${CATALOG_GRID_SCROLL_MAX_H}px)`,
        minHeight: CATALOG_GRID_SCROLL_MIN_H,
      }}
    >
      {dims.w > 0 ? (
        <Grid<CatalogCellPayload>
          gridRef={gridRef}
          cellComponent={VirtualCatalogCell}
          cellProps={cellProps}
          columnCount={columnCount}
          columnWidth={columnWidth}
          rowCount={rowCount}
          rowHeight={CATALOG_VIRTUAL_ROW_HEIGHT}
          overscanCount={4}
          defaultHeight={dims.h}
          defaultWidth={dims.w}
          className="max-w-full overflow-x-hidden overscroll-x-contain"
          style={{
            height: dims.h,
            width: dims.w,
            maxWidth: "100%",
          }}
          onCellsRendered={handleCellsRendered}
        />
      ) : null}
    </div>
  );
}
