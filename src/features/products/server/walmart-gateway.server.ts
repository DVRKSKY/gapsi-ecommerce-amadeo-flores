import "server-only";

import { extractWalmartItemsFromPayload } from "@/features/products/lib/extract-walmart-items";
import {
  collectWalmartHostedImageUrls,
  dfsFindMatchingWalmartProduct,
} from "@/features/products/lib/extract-walmart-lookup";
import type { ProductDetail, ProductPreview } from "@/features/products/models/product-ui.models";
import {
  mapApiProductForLookupToDetail,
  mapApiProductToPreview,
  pickRelatedHints,
} from "@/features/products/factories/walmart-product.factory";
import type { WalmartCredentials } from "@/features/products/server/walmart-credentials.server";
import { walmartAxessoHeaders } from "@/features/products/server/walmart-credentials.server";

export type LoadedSearchPack = {
  products: ProductPreview[];
  search: string;
  page: number;
};

export type ProductDetailResolved = {
  detail: ProductDetail | null;
  rawFound: boolean;
};

export class UpstreamBridgeError extends Error {
  constructor() {
    super("Fallo de red al contactar RapidAPI.");
    this.name = "UpstreamBridgeError";
  }
}

export class RapidApiRejectedError extends Error {
  constructor(public readonly status: number) {
    super("RapidAPI devolvió un error.");
    this.name = "RapidApiRejectedError";
  }
}

export class LookupParseError extends Error {
  constructor() {
    super("RapidAPI devolvió JSON inválido.");
    this.name = "LookupParseError";
  }
}

function normalizeBase(origin: string): string {
  return origin.replace(/\/$/, "");
}

function buildKeywordSearchUrl(baseUrl: string, keyword: string, page: number): string {
  const base = normalizeBase(baseUrl);
  const q = new URLSearchParams({
    keyword,
    page: String(page),
    sortBy: "best_match",
  });
  return `${base}/wlm/walmart-search-by-keyword?${q.toString()}`;
}

function buildProductLookupUrl(baseUrl: string, itemId: string): string {
  const base = normalizeBase(baseUrl);
  const slug = (process.env.WALMART_LOOKUP_PRODUCT_PATH ?? "/wlm/walmart-lookup-product").replace(
    /^\/?/,
    "",
  );
  const paramNameRaw = process.env.WALMART_LOOKUP_PRODUCT_QUERY_PARAM ?? "itemId";
  const paramName = paramNameRaw.trim().length > 0 ? paramNameRaw.trim() : "itemId";
  const q = new URLSearchParams({ [paramName]: itemId.trim() });
  return `${base}/${slug}?${q.toString()}`;
}

async function readAxessoJson(creds: WalmartCredentials, upstream: string): Promise<unknown | null> {
  let res: Response;
  try {
    res = await fetch(upstream, {
      method: "GET",
      headers: walmartAxessoHeaders(creds),
      cache: "no-store",
    });
  } catch {
    throw new UpstreamBridgeError();
  }

  const text = await res.text();

  if (!res.ok) {
    throw new RapidApiRejectedError(res.status);
  }

  try {
    return text.length > 0 ? (JSON.parse(text) as unknown) : null;
  } catch {
    throw new LookupParseError();
  }
}

export async function loadProductSearchPack(
  creds: WalmartCredentials,
  params: { search: string; page: number },
): Promise<LoadedSearchPack> {
  const keyword = params.search.trim();
  const upstream = buildKeywordSearchUrl(creds.baseUrl, keyword, params.page);
  const json = await readAxessoJson(creds, upstream);

  const extracted = extractWalmartItemsFromPayload(json ?? null);
  const previews: ProductPreview[] = [];

  for (const item of extracted) {
    const mapped = mapApiProductToPreview(item);
    if (mapped) previews.push(mapped);
  }

  return { products: previews, search: keyword, page: params.page };
}

export async function loadProductLookupDetail(
  creds: WalmartCredentials,
  itemId: string,
): Promise<ProductDetailResolved> {
  const normalizedId = itemId.trim();
  if (!normalizedId.length) {
    return { detail: null, rawFound: false };
  }

  const upstream = buildProductLookupUrl(creds.baseUrl, normalizedId);
  const json = await readAxessoJson(creds, upstream);

  const blob = dfsFindMatchingWalmartProduct(json ?? null, normalizedId);
  if (!blob) {
    return { detail: null, rawFound: Boolean(json !== null && json !== undefined) };
  }

  let urls = collectWalmartHostedImageUrls(blob, 18);
  if (urls.length < 2) {
    urls = [...new Set([...urls, ...collectWalmartHostedImageUrls(json, 18)])];
  }

  const hints = pickRelatedHints(blob);
  const detail = mapApiProductForLookupToDetail(blob, {
    galleryUrls: urls,
    relatedHints: hints,
  });

  return { detail, rawFound: true };
}

export async function loadRelatedPreviewsParallel(
  creds: WalmartCredentials,
  hints: readonly string[],
  excludeId: string,
  limit: number,
): Promise<ProductPreview[]> {
  const seeds = [...hints].map((h) => h.trim()).filter((h) => h.length > 2);
  const uniqueSeeds = [...new Set(seeds)].slice(0, 5);

  const settled = await Promise.allSettled(
    uniqueSeeds.map((term) => loadProductSearchPack(creds, { search: term, page: 1 })),
  );

  const used = new Set<string>([excludeId.trim()].filter(Boolean));
  const out: ProductPreview[] = [];

  for (const s of settled) {
    if (s.status !== "fulfilled") continue;
    for (const p of s.value.products) {
      if (used.has(p.id)) continue;
      used.add(p.id);
      out.push(p);
      if (out.length >= limit) return out;
    }
  }

  return out;
}
