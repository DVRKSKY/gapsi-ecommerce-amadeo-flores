"use client";

import { createDraggable } from "animejs";
import { useLayoutEffect, useRef, type RefObject } from "react";
import { useCartStore } from "@/features/cart";
import type { ShopProductDisplay } from "@/features/products/types";
import { isPointerOverDropZone } from "@/features/products/lib/pointer-hit";

export type UseProductDragArgs = {
  product: ShopProductDisplay;
  targetRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
};

const SNAP_HOME_MS = 380;

export function useProductDrag({ product, targetRef, triggerRef }: UseProductDragArgs) {
  const tearSessionRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    const target = targetRef.current;
    const trigger = triggerRef.current;
    if (!target || !trigger) return;

    const workspace = document.getElementById("tienda-workspace");
    let droppedIntoCart = false;
    let snapTimer: ReturnType<typeof setTimeout> | undefined;

    const draggable = createDraggable(target, {
      trigger,
      cursor: { onHover: "grab", onGrab: "grabbing" },
      releaseStiffness: 130,
      releaseDamping: 24,
      ...(workspace ? { container: workspace, containerPadding: 12 } : {}),

      onGrab: () => {
        if (snapTimer) {
          clearTimeout(snapTimer);
          snapTimer = undefined;
        }
        droppedIntoCart = false;
        tearSessionRef.current?.();

        useCartStore.getState().setDraggingProductId(product.id);

        const onPointerMove = (e: PointerEvent) => {
          const dz = useCartStore.getState().dropZoneEl;
          if (!dz) {
            useCartStore.getState().setDropZoneHovered(false);
            return;
          }
          const over = isPointerOverDropZone(e.clientX, e.clientY, dz, target);
          useCartStore.getState().setDropZoneHovered(over);
        };

        let gestureFinalized = false;
        const finishGesture = (e: PointerEvent | MouseEvent) => {
          if (gestureFinalized) return;
          gestureFinalized = true;
          tearSessionRef.current?.();
          tearSessionRef.current = null;

          const st = useCartStore.getState();
          const dz = st.dropZoneEl;
          let over = false;
          if (dz) {
            over = isPointerOverDropZone(e.clientX, e.clientY, dz, target);
          }

          if (over) {
            droppedIntoCart = true;
            st.addProduct(product);
          } else {
            snapTimer = setTimeout(() => {
              snapTimer = undefined;
              if (!droppedIntoCart) {
                draggable.reset();
              }
            }, SNAP_HOME_MS);
          }

          st.setDropZoneHovered(false);
          st.setDraggingProductId(null);
        };

        const onPointerUp = (e: PointerEvent) => finishGesture(e);
        const onMouseUp = (e: MouseEvent) => finishGesture(e);

        window.addEventListener("pointermove", onPointerMove, true);
        window.addEventListener("pointerup", onPointerUp, true);
        window.addEventListener("pointercancel", onPointerUp, true);
        document.addEventListener("mouseup", onMouseUp, true);

        tearSessionRef.current = () => {
          window.removeEventListener("pointermove", onPointerMove, true);
          window.removeEventListener("pointerup", onPointerUp, true);
          window.removeEventListener("pointercancel", onPointerUp, true);
          document.removeEventListener("mouseup", onMouseUp, true);
        };
      },

      onSettle: () => {
        if (!droppedIntoCart) {
          if (snapTimer) {
            clearTimeout(snapTimer);
            snapTimer = undefined;
          }
          draggable.reset();
        }
      },
    });

    return () => {
      if (snapTimer) clearTimeout(snapTimer);
      tearSessionRef.current?.();
      tearSessionRef.current = null;
      draggable.revert();
    };
  }, [product, targetRef, triggerRef]);
}
