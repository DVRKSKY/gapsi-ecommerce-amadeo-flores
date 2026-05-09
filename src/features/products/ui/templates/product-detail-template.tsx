import { ResponsiveContainer } from "@/shared/ui/layout/responsive-container";
import type { ProductDetail } from "@/features/products/models/product-ui.models";
import type { ShopProductDisplay } from "@/features/products/types";
import { ProductDetailHero } from "@/features/products/ui/organisms/product-detail-hero";
import { ProductInfoPanel } from "@/features/products/ui/organisms/product-info-panel";
import { RelatedProductsSection } from "@/features/products/ui/organisms/related-products-section";
import { cn } from "@/shared/utils/cn";

export type ProductDetailTemplateProps = {
  detail: ProductDetail;
  cartProduct: ShopProductDisplay;
  related: ShopProductDisplay[];
  catalogBackHref: string;
  preserveCatalogSearch?: string;
  className?: string;
};

export function ProductDetailTemplate({
  detail,
  cartProduct,
  related,
  catalogBackHref,
  preserveCatalogSearch,
  className,
}: ProductDetailTemplateProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <ResponsiveContainer className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-14 lg:py-12">
        <ProductDetailHero detail={detail} catalogBackHref={catalogBackHref} priorityMainImage />
        <ProductInfoPanel
          detail={detail}
          cartProduct={cartProduct}
          preserveCatalogSearch={preserveCatalogSearch}
        />
      </ResponsiveContainer>

      <ResponsiveContainer className="pb-14">
        <RelatedProductsSection
          items={related}
          preserveCatalogSearch={
            preserveCatalogSearch?.trim().length ? preserveCatalogSearch : undefined
          }
        />
      </ResponsiveContainer>
    </div>
  );
}
