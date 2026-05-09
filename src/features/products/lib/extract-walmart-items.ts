import type { WalmartApiProduct } from "../api/walmart-raw.types";

function unwrapStringJson(payload: unknown): unknown {
  let cur = payload;
  for (let i = 0; i < 5; i++) {
    if (typeof cur !== "string") break;
    const t = cur.trim();
    if (!((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]")))) break;
    try {
      cur = JSON.parse(t) as unknown;
    } catch {
      break;
    }
  }
  return cur;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function stripNestedListing(row: Record<string, unknown>): Record<string, unknown> {
  if (typeof row.usItemId === "string" || typeof row.usItemId === "number") return row;
  if (typeof row.itemId === "string" || typeof row.itemId === "number") return row;
  if (typeof row.canonicalUrl === "string" && row.canonicalUrl.includes("/ip/")) return row;
  const innerKeys = ["item", "product", "featuredProduct", "trackingData", "value"] as const;
  for (const k of innerKeys) {
    const inner = row[k];
    if (isPlainObject(inner)) return inner;
  }
  return row;
}

function readTitle(o: Record<string, unknown>): string {
  return (
    (typeof o.name === "string" && o.name.trim()) ||
    (typeof o.title === "string" && o.title.trim()) ||
    (typeof o.productName === "string" && o.productName.trim()) ||
    (typeof o.productTitle === "string" && o.productTitle.trim()) ||
    ""
  );
}

/** Id de artículo Walmart (no el id genérico de chips de marca / facetas). */
function validWalmartItemId(v: unknown): boolean {
  if (typeof v === "number" && Number.isFinite(v) && v >= 100_000) return true;
  if (typeof v !== "string") return false;
  const t = v.trim();
  return /^\d{5,14}$/.test(t);
}

function hasProductIdentity(o: Record<string, unknown>): boolean {
  if (typeof o.canonicalUrl === "string" && o.canonicalUrl.includes("/ip/")) return true;
  if (validWalmartItemId(o.usItemId) || validWalmartItemId(o.itemId) || validWalmartItemId(o.productId)) {
    return true;
  }
  return false;
}

function hasProductMediaOrOffer(o: Record<string, unknown>): boolean {
  const img = typeof o.image === "string" ? o.image : "";
  if (img.startsWith("http")) return true;
  const ii = o.imageInfo;
  if (isPlainObject(ii) && typeof ii.thumbnailUrl === "string" && ii.thumbnailUrl.startsWith("http")) {
    return true;
  }
  if (typeof o.offerId === "string" && o.offerId.length > 10) return true;
  return false;
}

/**
 * Fila de producto real en resultados (no chips de marca como "Apple", "Sony").
 * Requiere URL /ip/, id numérico largo, o imagen+oferta con título descriptivo.
 */
function isWalmartProductRow(r: Record<string, unknown>): boolean {
  const o = stripNestedListing(r);
  const title = readTitle(o);
  if (title.length < 3) return false;

  if (hasProductIdentity(o)) return true;

  if (hasProductMediaOrOffer(o) && title.length >= 14) return true;

  return false;
}

function pickItemsFromStacks(stacks: unknown): WalmartApiProduct[] {
  if (!Array.isArray(stacks) || stacks.length === 0) return [];
  const out: WalmartApiProduct[] = [];
  for (const st of stacks) {
    if (!isPlainObject(st)) continue;
    const rawItems = st["items"] ?? st["products"] ?? st["records"];
    if (!Array.isArray(rawItems)) continue;
    for (const el of rawItems) {
      if (!isPlainObject(el)) continue;
      const row = stripNestedListing(el);
      if (isWalmartProductRow(row)) out.push(row as WalmartApiProduct);
    }
  }
  return out;
}

function tryNextDataPaths(root: unknown): WalmartApiProduct[] {
  if (!isPlainObject(root)) return [];

  let pageProps: unknown = root["pageProps"];
  const propsOuter = root["props"];
  if (!pageProps && isPlainObject(propsOuter)) pageProps = propsOuter["pageProps"];

  if (!pageProps || !isPlainObject(pageProps)) return [];

  const initial = pageProps["initialData"] ?? root["initialData"];
  if (!isPlainObject(initial)) return [];

  const sr =
    initial["searchResult"] ?? initial["catalog"] ?? initial["search"] ?? root["searchResult"];
  if (!isPlainObject(sr)) return [];

  const stacks =
    sr["itemStacks"] ?? sr["stacks"] ?? sr["layouts"] ?? sr["results"] ?? sr["items"];
  if (Array.isArray(stacks)) {
    const fromStacks = pickItemsFromStacks(stacks);
    if (fromStacks.length > 0) return fromStacks;
    const maybeFlat = pickFromArrayBestEffort(stacks);
    if (maybeFlat.length > 0) return maybeFlat;
  }

  const flat = sr["items"] ?? sr["products"];
  if (Array.isArray(flat)) return pickFromArrayBestEffort(flat);

  return [];
}

function pickFromArrayBestEffort(arr: unknown[]): WalmartApiProduct[] {
  const objs = arr.filter(isPlainObject);
  const hits = objs.filter((o) => isWalmartProductRow(stripNestedListing(o)));
  return hits as WalmartApiProduct[];
}

function arrayQualityScore(rows: readonly WalmartApiProduct[]): number {
  let s = 0;
  for (const raw of rows) {
    const o = stripNestedListing(raw as Record<string, unknown>);
    if (hasProductIdentity(o)) s += 100;
    else if (hasProductMediaOrOffer(o)) s += 15;
    else s += 1;
  }
  return s;
}

function isStrongerProductList(a: WalmartApiProduct[], b: WalmartApiProduct[]): boolean {
  if (a.length !== b.length) return a.length > b.length;
  return arrayQualityScore(a) > arrayQualityScore(b);
}

function dfsLargestListingArray(root: unknown, depth = 0): WalmartApiProduct[] {
  if (depth > 26) return [];
  let best: WalmartApiProduct[] = [];

  if (Array.isArray(root)) {
    const direct = pickFromArrayBestEffort(root);
    if (isStrongerProductList(direct, best)) best = direct;
    for (const el of root) {
      const sub = dfsLargestListingArray(el, depth + 1);
      if (isStrongerProductList(sub, best)) best = sub;
    }
    return best;
  }

  if (isPlainObject(root)) {
    for (const v of Object.values(root)) {
      const sub = dfsLargestListingArray(v, depth + 1);
      if (isStrongerProductList(sub, best)) best = sub;
    }
    return best;
  }

  return best;
}

function tryRootShortcuts(root: unknown): WalmartApiProduct[] {
  if (!isPlainObject(root)) return [];
  /** `products` a menudo son facetas/marcas — al final si existen claves típicas de listado */
  for (const k of ["searchItems", "searchResults", "items", "results", "products"]) {
    const v = root[k];
    if (!Array.isArray(v)) continue;
    const got = pickFromArrayBestEffort(v);
    if (got.length > 0) return got;
  }
  return [];
}

function tryMergedSingleListing(root: unknown): WalmartApiProduct[] {
  if (!isPlainObject(root)) return [];
  const hasKw = typeof root.keyword === "string" || typeof root.searchKeyword === "string";
  const r = stripNestedListing(root);
  if (hasKw && isWalmartProductRow(r)) return [r as WalmartApiProduct];
  return [];
}

/** Intenta obtener filas tipo listado RapidAPI/Walmart desde cualquier envoltorio. */
export function extractWalmartItemsFromPayload(payload: unknown): WalmartApiProduct[] {
  const data = unwrapStringJson(payload);

  let out = tryMergedSingleListing(data);
  if (out.length > 0) return out;

  if (Array.isArray(data)) {
    out = pickFromArrayBestEffort(data);
    if (out.length > 0) return out;
    return dfsLargestListingArray(data);
  }

  out = tryNextDataPaths(data);
  if (out.length > 0) return out;

  out = tryRootShortcuts(data);
  if (out.length > 0) return out;

  return dfsLargestListingArray(data);
}
