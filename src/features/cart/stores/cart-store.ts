import { create } from "zustand";
import type { ShopProductDisplay } from "@/features/products/types";
import type { CartLineDisplay } from "../types";
import { MAX_CART_LINES } from "../constants";

type CartUi = {
  draggingProductId: string | null;
  dropZoneHovered: boolean;
};

type CartStoreState = {
  lines: CartLineDisplay[];
  dropZoneEl: HTMLElement | null;
  ui: CartUi;
  registerDropZone: (el: HTMLElement | null) => void;
  setDraggingProductId: (productId: string | null) => void;
  setDropZoneHovered: (hovered: boolean) => void;
  addProduct: (product: ShopProductDisplay) => void;
  removeLineById: (lineId: string) => void;
};

const nextLineId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? `c-${crypto.randomUUID()}` : `c-${Date.now()}`;

export const useCartStore = create<CartStoreState>((set, get) => ({
  lines: [],
  dropZoneEl: null,
  ui: { draggingProductId: null, dropZoneHovered: false },

  registerDropZone: (dropZoneEl) => set({ dropZoneEl }),

  setDraggingProductId: (draggingProductId) =>
    set((s) => ({
      ui: { ...s.ui, draggingProductId },
    })),

  setDropZoneHovered: (dropZoneHovered) =>
    set((s) => ({
      ui: { ...s.ui, dropZoneHovered },
    })),

  addProduct: (product) => {
    const { lines } = get();
    if (lines.length >= MAX_CART_LINES) return;

    const existingIdx = lines.findIndex((l) => l.productId === product.id);
    if (existingIdx !== -1) {
      const prev = lines[existingIdx];
      const next = [...lines];
      next[existingIdx] = { ...prev, quantity: prev.quantity + 1 };
      set({ lines: next });
      return;
    }

    const line: CartLineDisplay = {
      id: nextLineId(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      currency: product.currency ?? "MXN",
      imageSrc: product.imageSrc,
    };

    set({ lines: [...lines, line] });
  },

  removeLineById: (lineId) =>
    set((s) => ({
      lines: s.lines.filter((l) => l.id !== lineId),
    })),
}));
