import type { WalmartApiProduct, WalmartPagePropsShape, WalmartProductsResponse } from "../api/walmart-raw.types";

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object") return null;
  if (Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function readPageProps(data: unknown): WalmartPagePropsShape | undefined {
  const root = asRecord(data);
  if (!root) return undefined;

  const direct = root["pageProps"];
  if (direct && typeof direct === "object" && !Array.isArray(direct)) {
    return direct as WalmartPagePropsShape;
  }

  const props = root["props"];
  const propsRec = asRecord(props);
  if (!propsRec) return undefined;
  const nested = propsRec["pageProps"];
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as WalmartPagePropsShape;
  }

  return undefined;
}

function isWalmartProductsEnvelope(data: unknown): data is WalmartProductsResponse {
  const r = asRecord(data);
  if (!r) return false;
  return "props" in r;
}

const WRAPPER_KEYS = ["data", "result", "body", "payload", "response", "_data"] as const;

/** RapidAPI suele envolver el JSON (__NEXT_DATA__ o Axesso simplificado). */
function collectPeekRoots(data: unknown, maxRoots = 12): unknown[] {
  const out: unknown[] = [];
  const seen = new Set<unknown>();
  function push(v: unknown) {
    if (v === null || v === undefined) return;
    if (seen.has(v)) return;
    seen.add(v);
    out.push(v);
    if (out.length >= maxRoots) return;
  }

  push(data);
  let i = 0;
  while (i < out.length && out.length < maxRoots) {
    const cur = out[i++];
    const rec = asRecord(cur);
    if (!rec) continue;
    for (const k of WRAPPER_KEYS) {
      if (out.length >= maxRoots) break;
      const inner = rec[k];
      if (inner && typeof inner === "object") push(inner);
    }
  }

  return out;
}

function isProductLikeObject(v: unknown): boolean {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const r = v as Record<string, unknown>;
  const nameOk =
    (typeof r.name === "string" && r.name.trim().length > 0) ||
    (typeof r.title === "string" && r.title.trim().length > 0);
  const idOk =
    r.usItemId !== undefined ||
    r.itemId !== undefined ||
    (r.id !== undefined && String(r.id).trim().length > 0 && String(r.id) !== "[object Object]");
  return Boolean(nameOk && idOk);
}

function coerceProductArray(candidate: unknown): WalmartApiProduct[] {
  if (!Array.isArray(candidate) || candidate.length === 0) return [];
  const objects = candidate.filter((x) => x !== null && typeof x === "object" && !Array.isArray(x));
  if (objects.length === 0) return [];
  const like = objects.filter(isProductLikeObject);
  if (like.length === 0) return [];
  if (like.length / objects.length >= 0.35) return like as WalmartApiProduct[];
  return [];
}

function stacksToItemsFlat(stacks: unknown): WalmartApiProduct[] {
  if (!Array.isArray(stacks) || stacks.length === 0) return [];
  const merged: WalmartApiProduct[] = [];
  for (const stack of stacks) {
    if (!stack || typeof stack !== "object" || Array.isArray(stack)) continue;
    const items = (stack as { items?: unknown }).items;
    const arr = coerceProductArray(items);
    for (const it of arr) merged.push(it);
  }
  return merged;
}

function extractFromRoots(roots: readonly unknown[]): WalmartApiProduct[] {
  for (const root of roots) {
    let pageProps: WalmartPagePropsShape | undefined;

    if (isWalmartProductsEnvelope(root)) {
      pageProps = root.props?.pageProps;
    } else {
      pageProps = readPageProps(root);
    }

    let stacks: unknown = pageProps?.initialData?.searchResult?.itemStacks;
    if (!Array.isArray(stacks) || stacks.length === 0) {
      const r = asRecord(root);
      const initial = r?.initialData ?? r?.["initial_data"];
      if (initial && typeof initial === "object" && !Array.isArray(initial)) {
        const sr = (initial as Record<string, unknown>)["searchResult"];
        stacks =
          sr && typeof sr === "object" && !Array.isArray(sr)
            ? (sr as Record<string, unknown>)["itemStacks"]
            : undefined;
      }
    }

    if (Array.isArray(stacks) && stacks.length > 0) {
      const fromStacks = stacksToItemsFlat(stacks);
      if (fromStacks.length > 0) return fromStacks;
    }

    const rec = asRecord(root);
    if (rec) {
      const srFlat = rec["searchResult"];
      if (srFlat && typeof srFlat === "object" && !Array.isArray(srFlat)) {
        const nestedStacks = (srFlat as Record<string, unknown>)["itemStacks"];
        const fromNested = stacksToItemsFlat(nestedStacks);
        if (fromNested.length > 0) return fromNested;
      }

      for (const k of ["products", "items", "searchItems", "searchResults"]) {
        const fromKey = coerceProductArray(rec[k]);
        if (fromKey.length > 0) return fromKey;
      }
    }
  }

  return [];
}

function dfsBestProductLikeArray(node: unknown, depth = 0): WalmartApiProduct[] {
  if (depth > 16) return [];

  if (Array.isArray(node)) {
    const coerced = coerceProductArray(node);
    if (coerced.length > 0) return coerced;
    let best: WalmartApiProduct[] = [];
    for (const el of node) {
      const got = dfsBestProductLikeArray(el, depth + 1);
      if (got.length > best.length) best = got;
    }
    return best;
  }

  if (node && typeof node === "object") {
    let best: WalmartApiProduct[] = [];
    for (const v of Object.values(node as Record<string, unknown>)) {
      const got = dfsBestProductLikeArray(v, depth + 1);
      if (got.length > best.length) best = got;
    }
    return best;
  }

  return [];
}

export function extractWalmartItemsFromPayload(data: unknown): WalmartApiProduct[] {
  if (Array.isArray(data)) {
    const direct = coerceProductArray(data);
    if (direct.length > 0) return direct;
  }

  const roots = collectPeekRoots(data);
  const fromStructures = extractFromRoots(roots);
  if (fromStructures.length > 0) return fromStructures;

  return dfsBestProductLikeArray(data);
}
