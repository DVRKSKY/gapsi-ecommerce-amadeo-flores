import type { WalmartApiProduct, WalmartVariant as WalmartVariantRaw } from "../api/walmart-raw.types";
import { WALMART_LIST_CURRENCY, WALMART_ORIGIN } from "../constants/walmart";
import { collectWalmartHostedImageUrls } from "../lib/extract-walmart-lookup";
import type {
  ProductDetail,
  ProductImage,
  ProductPreview,
  ProductVariant,
} from "../models/product-ui.models";
import type { ShopProductDisplay } from "../types";
import { stripHtmlToText } from "@/shared/utils/strip-html";

function coercePositivePrice(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
    return null;
  }
  return v;
}

function priceFromScalar(raw: unknown): number | null {
  const num = coercePositivePrice(raw);
  if (num !== null) return num;

  if (typeof raw === "string") {
    const normalized = raw.replace(/,/g, "");
    const m = normalized.match(/(\d+(\.\d+)?)/);
    if (m?.[1]) {
      const n = Number.parseFloat(m[1]);
      if (Number.isFinite(n) && n >= 0) return n;
    }
  }

  return null;
}

function firstPositivePrice(...raws: readonly unknown[]): number | null {
  for (const raw of raws) {
    const n = priceFromScalar(raw);
    if (n !== null && n > 0) return n;
  }
  return null;
}

function extractFlexiblePrice(api: WalmartApiProduct): number | null {
  const rec = api as Record<string, unknown>;
  const fromTop = firstPositivePrice(api.price);
  if (fromTop !== null) return fromTop;

  const priceInfo = rec["priceInfo"];
  if (priceInfo && typeof priceInfo === "object" && !Array.isArray(priceInfo)) {
    const pi = priceInfo as Record<string, unknown>;
    const fromStrings = firstPositivePrice(pi["linePrice"], pi["itemPrice"], pi["linePriceDisplay"]);
    if (fromStrings !== null) return fromStrings;

    const current = pi["currentPrice"];
    if (current && typeof current === "object" && !Array.isArray(current)) {
      const cp = current as Record<string, unknown>;
      const fromCp = firstPositivePrice(cp["price"], cp["displayPrice"]);
      if (fromCp !== null) return fromCp;
    }

    const infoFallback = firstPositivePrice(pi["wasPrice"]);
    if (infoFallback !== null) return infoFallback;
  }

  return firstPositivePrice(
    rec["salePrice"],
    rec["offerPrice"],
    rec["currentPrice"],
    rec["listPrice"],
    rec["wasPrice"],
  );
}

function coerceId(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  return s.length > 0 ? s : null;
}

function coerceString(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  return s.length > 0 ? s : null;
}

function readLooseString(rec: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const k of keys) {
    const got = coerceString(rec[k]);
    if (got) return got;
    const nested = rec[k];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const name = coerceString((nested as Record<string, unknown>)["name"]);
      if (name) return name;
    }
  }
  return null;
}

export function pickRelatedHints(blob: WalmartApiProduct): string[] {
  const rec = blob as Record<string, unknown>;
  const hints: string[] = [];
  const push = (s: string | null) => {
    if (!s) return;
    const t = s.trim();
    if (t.length < 2 || t.length > 120) return;
    if (!hints.some((x) => x.toLowerCase() === t.toLowerCase())) hints.push(t);
  };

  push(coerceString(blob.sellerName));
  push(readLooseString(rec, ["brand", "brandName", "manufacturer"]));
  push(readLooseString(rec, ["productType", "productSubtype"]));
  push(readLooseString(rec, ["primaryCategoryPath", "categoryPath", "category"]));

  const name = coerceString(blob.name);
  if (name) {
    const tokens = name.split(/\s+/).filter((w) => w.replace(/[^\w]/g, "").length > 3);
    if (tokens[0]) push(tokens[0]);

    const normalized = /^[a-z]+\s+[a-z0-9]+\s+/i.exec(name);
    if (normalized && normalized[0]) push(normalized[0].trim());
  }

  return hints.slice(0, 8);
}

function coerceWalmartListingId(blob: WalmartApiProduct | WalmartVariantRaw): string | null {
  const rec = blob as Record<string, unknown>;
  return coerceId(blob.usItemId) ?? coerceId(rec["itemId"]) ?? coerceId(rec["id"]);
}

export function mapApiVariant(raw: WalmartVariantRaw): ProductVariant | null {
  const id = coerceWalmartListingId(raw);
  const rec = raw as Record<string, unknown>;
  const name = coerceString(raw.name) ?? coerceString(rec["title"]);
  if (!id || !name) return null;
  const price = extractFlexiblePrice(raw as WalmartApiProduct) ?? priceFromScalar(raw.price);
  const imageRaw = coerceString(raw.image);
  return {
    id,
    name,
    price,
    imageUrl: imageRaw ?? undefined,
  };
}

export function mapApiProductToPreview(api: WalmartApiProduct): ProductPreview | null {
  const id = coerceWalmartListingId(api);
  const recProd = api as Record<string, unknown>;
  const name =
    coerceString(api.name) ??
    coerceString(recProd["title"]) ??
    coerceString(recProd["productName"]);
  if (!id || !name) return null;

  const priceNum = extractFlexiblePrice(api);
  if (priceNum === null) return null;

  const imgMain =
    coerceString(api.image) ??
    coerceString(recProd["imageUrl"]) ??
    coerceString(recProd["thumbnailUrl"]);
  const thumbNested = api.imageInfo?.thumbnailUrl;
  const thumb =
    coerceString(thumbNested) ??
    coerceString(recProd["thumbnailUrl"]) ??
    coerceString((recProd["imageInfo"] as Record<string, unknown> | undefined)?.["thumbnailUrl"]);

  const smallUrl =
    typeof recProd["smallImage"] === "object" &&
    recProd["smallImage"] !== null &&
    !Array.isArray(recProd["smallImage"])
      ? coerceString((recProd["smallImage"] as Record<string, unknown>).url)
      : null;

  const url = imgMain ?? thumb ?? smallUrl ?? coerceString(recProd["thumbnailUrl"]) ?? "";

  const image: ProductImage = {
    url,
    ...(thumb && thumb !== url ? { thumbnailUrl: thumb } : {}),
  };

  const rawVariants = Array.isArray(api.variantList) ? api.variantList : [];
  const variants: ProductVariant[] = [];
  for (const v of rawVariants) {
    const mapped = mapApiVariant(v);
    if (mapped) variants.push(mapped);
  }

  const availabilityDisplay =
    coerceString(api.availabilityStatusV2?.display) ??
    coerceString(recProd["availabilityStatusDisplayValue"]) ??
    coerceString(recProd["stock"]);

  const shortDesc =
    coerceString(api.shortDescription) ??
    coerceString(recProd["description"]) ??
    coerceString(recProd["shortDescriptionText"]);
  const canonical = coerceString(api.canonicalUrl);
  const seller = coerceString(api.sellerName);

  let ratingAvg: unknown = api.averageRating;
  let reviewsCnt: unknown = api.numberOfReviews;
  const ratingObj = recProd.rating;
  if (ratingObj && typeof ratingObj === "object" && !Array.isArray(ratingObj)) {
    const ro = ratingObj as Record<string, unknown>;
    if (ratingAvg === undefined || ratingAvg === null) ratingAvg = ro.averageRating;
    if (reviewsCnt === undefined || reviewsCnt === null) reviewsCnt = ro.numberOfReviews;
  }

  const rating =
    typeof ratingAvg === "number" && Number.isFinite(ratingAvg) ? ratingAvg : null;
  const reviews =
    typeof reviewsCnt === "number" && Number.isFinite(reviewsCnt) && reviewsCnt >= 0
      ? Math.round(reviewsCnt)
      : null;

  return {
    id,
    name,
    price: priceNum,
    currency: WALMART_LIST_CURRENCY,
    shortDescription: shortDesc,
    canonicalUrl: canonical,
    sellerName: seller,
    averageRating: rating,
    numberOfReviews: reviews,
    availabilityDisplay,
    image,
    variants,
  };
}

export function mapApiProductForLookupToDetail(
  blob: WalmartApiProduct,
  opts: { galleryUrls: readonly string[]; relatedHints: readonly string[] },
): ProductDetail | null {
  const preview = mapApiProductToPreview(blob);
  if (!preview) return null;

  const rec = blob as Record<string, unknown>;
  const rawDesc = coerceString(rec["shortDescription"]) ?? preview.shortDescription;
  const longDescription = stripHtmlToText(rawDesc) ?? rawDesc;

  const walmartUrl =
    preview.canonicalUrl !== null
      ? `${WALMART_ORIGIN}${preview.canonicalUrl.startsWith("/") ? preview.canonicalUrl : `/${preview.canonicalUrl}`}`
      : null;

  const brandText = readLooseString(rec, ["brand", "brandName", "manufacturer"]);
  const categoryText = readLooseString(rec, ["productType", "primaryCategory", "taxonomyCategory"]);

  const primary = coerceString(preview.image.url || preview.image.thumbnailUrl || "");
  const merged = [...(primary ? [primary] : []), ...opts.galleryUrls];
  const unique = [...new Set(merged.map((u) => u.trim()).filter(Boolean))];

  const gallery: ProductImage[] =
    unique.length > 0
      ? unique.map((url) => ({ url }))
      : preview.image.url
        ? [{ url: preview.image.url }]
        : [];

  const relatedSearchHints = Object.freeze([...new Set(opts.relatedHints.map((h) => h.trim()))]);

  return {
    ...preview,
    longDescription,
    gallery,
    walmartUrl,
    brandText,
    categoryText,
    relatedSearchHints,
  };
}

export function mapApiProductToDetail(api: WalmartApiProduct): ProductDetail | null {
  const urls = collectWalmartHostedImageUrls(api, 16);
  return mapApiProductForLookupToDetail(api, {
    galleryUrls: urls,
    relatedHints: pickRelatedHints(api),
  });
}

export function previewToShopProductDisplay(preview: ProductPreview): ShopProductDisplay {
  const imageSrc = preview.image.url || preview.image.thumbnailUrl;

  return {
    id: preview.id,
    name: preview.name,
    subtitle: preview.shortDescription ?? preview.sellerName ?? undefined,
    price: preview.price,
    currency: preview.currency,
    badge: preview.availabilityDisplay ?? undefined,
    ...(imageSrc ? { imageSrc } : {}),
  };
}

export function catalogDetailToShopDisplay(detail: ProductDetail): ShopProductDisplay {
  const thumb = detail.gallery[0]?.url ?? detail.image.url ?? detail.image.thumbnailUrl;
  return {
    id: detail.id,
    name: detail.name,
    subtitle: detail.shortDescription ?? detail.sellerName ?? undefined,
    price: detail.price,
    currency: detail.currency,
    badge: detail.availabilityDisplay ?? undefined,
    ...(thumb ? { imageSrc: thumb } : {}),
  };
}
