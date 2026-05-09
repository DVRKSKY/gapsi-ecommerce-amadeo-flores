"use client";

import type { RefCallback } from "react";
import { useCallback, useEffect, useState } from "react";

export type UseIntersectionObserverOptions = Omit<IntersectionObserverInit, "root"> & {
  root?: Element | Document | null;
  enabled?: boolean;
};

/** IntersectionObserver como patrón Observer: expone estado y ref del nodo observado. */
export function useIntersectionObserver(options?: UseIntersectionObserverOptions) {
  const { enabled = true, root, rootMargin, threshold } = options ?? {};

  const [target, setTarget] = useState<Element | null>(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!enabled || !target) return;

    const obs = new IntersectionObserver(([entry]) => {
      setIntersecting(Boolean(entry?.isIntersecting));
    }, { root: root ?? null, rootMargin, threshold: threshold ?? 0 });

    obs.observe(target);
    return () => obs.disconnect();
  }, [enabled, target, root, rootMargin, threshold]);

  const ref: RefCallback<Element> = useCallback((node) => {
    setTarget((prev) => (prev === node ? prev : node));
  }, []);

  return { ref, isIntersecting };
}
