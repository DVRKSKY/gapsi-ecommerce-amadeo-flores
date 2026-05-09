"use client";

import { useSyncExternalStore } from "react";

/** Drag al carrito: solo pantalla grande + puntero fino (no táctiles “coarse”). */
export function subscribePointerDragAllowed(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const mqs = [window.matchMedia("(min-width: 1024px)"), window.matchMedia("(pointer: fine)")];

  const onChange = () => onStoreChange();
  for (const mq of mqs) {
    mq.addEventListener("change", onChange);
  }
  return () => {
    for (const mq of mqs) {
      mq.removeEventListener("change", onChange);
    }
  };
}

export function getPointerDragAllowedSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(min-width: 1024px)").matches && window.matchMedia("(pointer: fine)").matches
  );
}

function getPointerDragAllowedServerSnapshot(): boolean {
  return false;
}

export function usePointerDragAllowed(): boolean {
  return useSyncExternalStore(
    subscribePointerDragAllowed,
    getPointerDragAllowedSnapshot,
    getPointerDragAllowedServerSnapshot,
  );
}
