import type { Metadata } from "next";
import { ProductDetailFromCache } from "@/features/products/ui/organisms/product-detail-from-cache";
import { StoreShell } from "@/shared/layouts/store-shell";
import { routes } from "@/shared/constants/routes";

export const dynamic = "force-dynamic";

function truncateMeta(text: string, max: number): string {
  const s = text.trim().replace(/\s+/g, " ");
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ search?: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const decoded = decodeURIComponent(id).trim();
  const label = truncateMeta(decoded, 48);

  return {
    title: label.length ? `Producto · ${label}` : "Producto",
  };
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const [{ id }, spResolved] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as Record<string, string | string[] | undefined>),
  ]);

  const productId = decodeURIComponent(id).trim();

  const searchRaw = typeof spResolved.search === "string" ? spResolved.search : undefined;
  const preserve =
    typeof searchRaw === "string" && searchRaw.trim().length > 0 ? searchRaw.trim() : undefined;

  const catalogBackHref = routes.catalogWithSearch(preserve ?? "");

  return (
    <StoreShell>
      <ProductDetailFromCache
        productId={productId}
        catalogBackHref={catalogBackHref}
        preserveCatalogSearch={preserve}
      />
    </StoreShell>
  );
}
