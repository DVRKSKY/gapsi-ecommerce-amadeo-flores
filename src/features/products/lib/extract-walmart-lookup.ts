import type { WalmartApiProduct } from "../api/walmart-raw.types";

const IMAGE_HINT = /^https:\/\/[^/]+\.walmartimages\.com\/.+/i;

function coerceIdCandidate(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

function nodeMatches(node: Record<string, unknown>, normalizedTarget: string): boolean {
  const a = coerceIdCandidate(node.usItemId);
  const b = coerceIdCandidate(node.itemId);
  return a === normalizedTarget || b === normalizedTarget;
}

export function dfsFindMatchingWalmartProduct(
  node: unknown,
  targetUsItemId: string,
  depth = 0,
): WalmartApiProduct | null {
  const target = targetUsItemId.trim();
  if (!target.length || depth > 24) return null;

  if (node === null || typeof node !== "object") return null;

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = dfsFindMatchingWalmartProduct(item, target, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const rec = node as Record<string, unknown>;

  if (nodeMatches(rec, target)) {
    return rec as unknown as WalmartApiProduct;
  }

  for (const next of Object.values(rec)) {
    const found = dfsFindMatchingWalmartProduct(next, target, depth + 1);
    if (found) return found;
  }

  return null;
}

export function collectWalmartHostedImageUrls(node: unknown, max = 20, depth = 0, out?: Set<string>): string[] {
  const acc = out ?? new Set<string>();
  if (depth > 28 || acc.size >= max) return [...acc];

  if (typeof node === "string" && IMAGE_HINT.test(node)) {
    acc.add(node.trim());
    return [...acc];
  }

  if (node !== null && typeof node === "object") {
    if (Array.isArray(node)) {
      for (const el of node) {
        collectWalmartHostedImageUrls(el, max, depth + 1, acc);
        if (acc.size >= max) break;
      }
      return [...acc];
    }

    for (const v of Object.values(node as Record<string, unknown>)) {
      collectWalmartHostedImageUrls(v, max, depth + 1, acc);
      if (acc.size >= max) break;
    }
  }

  return [...acc];
}

export function coerceScalarText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}
