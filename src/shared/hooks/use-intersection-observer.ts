"use client";

import type { RefCallback } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const [target, setTarget] = useState<Element | null>(null);
  const [isIntersecting, setIntersecting] = useState(false);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const ref: RefCallback<Element> = useCallback((node) => {
    setTarget((prev) => (prev === node ? prev : node));
  }, []);

  useEffect(() => {
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry?.isIntersecting ?? false);
    }, optionsRef.current);
    observer.observe(target);
    return () => observer.disconnect();
  }, [target]);

  return { ref, isIntersecting };
}
