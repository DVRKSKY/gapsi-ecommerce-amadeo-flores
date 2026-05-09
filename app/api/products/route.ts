import { NextResponse } from "next/server";
import type { ProductPreview } from "@/features/products/models/product-ui.models";
import {
  loadProductLookupDetail,
  loadProductSearchPack,
  LookupParseError,
  RapidApiRejectedError,
  UpstreamBridgeError,
} from "@/features/products/server/walmart-gateway.server";
import { readWalmartCredentials } from "@/features/products/server/walmart-credentials.server";

const TERM_MIN = 1;
const TERM_MAX = 120;

type SearchResponseBody = {
  products: ProductPreview[];
  search: string;
  page: number;
  hasMore: boolean;
};

type DetailResponseBody = {
  product: import("@/features/products/models/product-ui.models").ProductDetail;
};

function parsePositiveInt(raw: string | null, fallback: number): number | undefined {
  if (raw === null || raw === undefined) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return n;
}

function mapRouteError(e: unknown): { status: number; message: string } {
  if (e instanceof RapidApiRejectedError) {
    return { status: 502, message: e.message };
  }
  if (e instanceof UpstreamBridgeError) {
    return { status: 502, message: e.message };
  }
  if (e instanceof LookupParseError) {
    return { status: 502, message: e.message };
  }
  return { status: 500, message: "Error inesperado del servidor." };
}

export async function GET(req: Request) {
  const creds = readWalmartCredentials();
  if (!creds) {
    return NextResponse.json(
      { error: "Servidor sin configuración de RapidAPI/Walmart." },
      { status: 500 },
    );
  }

  let urlObj: URL;
  try {
    urlObj = new URL(req.url);
  } catch {
    return NextResponse.json({ error: "URL inválida." }, { status: 400 });
  }

  const itemIdRaw = urlObj.searchParams.get("itemId");
  const searchRaw = urlObj.searchParams.get("search");
  const hasItem = itemIdRaw !== null && itemIdRaw.trim().length > 0;
  const hasSearch = searchRaw !== null && searchRaw.trim().length > 0;

  if (hasItem === hasSearch) {
    return NextResponse.json(
      { error: "Enviá exactamente itemId o search (no ambos)." },
      { status: 400 },
    );
  }

  if (hasItem) {
    const itemId = itemIdRaw!.trim();
    if (itemId.length > 96 || !/^[0-9A-Za-z_-]+$/.test(itemId)) {
      return NextResponse.json({ error: "itemId inválido." }, { status: 400 });
    }

    try {
      const pack = await loadProductLookupDetail(creds, itemId);
      if (!pack.detail) {
        return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
      }
      const body: DetailResponseBody = { product: pack.detail };
      return NextResponse.json(body);
    } catch (e: unknown) {
      const mapped = mapRouteError(e);
      return NextResponse.json({ error: mapped.message }, { status: mapped.status });
    }
  }

  const pageParsed = parsePositiveInt(urlObj.searchParams.get("page"), 1);
  if (pageParsed === undefined) {
    return NextResponse.json({ error: "Parámetro page inválido." }, { status: 400 });
  }

  const search = searchRaw!.trim();
  if (search.length < TERM_MIN || search.length > TERM_MAX) {
    return NextResponse.json(
      { error: `search debe tener entre ${TERM_MIN} y ${TERM_MAX} caracteres.` },
      { status: 400 },
    );
  }

  try {
    const pack = await loadProductSearchPack(creds, { search, page: pageParsed });
    const body: SearchResponseBody = {
      products: pack.products,
      search: pack.search,
      page: pack.page,
      hasMore: pack.hasMore,
    };
    return NextResponse.json(body);
  } catch (e: unknown) {
    const mapped = mapRouteError(e);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
