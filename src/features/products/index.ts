export {
  DEFAULT_INITIAL_CATALOG_SEARCH,
  PRODUCTS_QUERY_STALE_MS,
  SUGGESTED_PRODUCT_QUERIES,
} from "./constants/search-ui";
export { WALMART_LIST_CURRENCY, WALMART_ORIGIN } from "./constants/walmart";
export { PRODUCTS_PAGE_SIZE } from "./constants";

export type {
  WalmartApiProduct,
  WalmartImageInfo,
  WalmartProductsResponse,
  WalmartVariant,
} from "./api/walmart-raw.types";

export type { ProductDetail, ProductImage, ProductPreview, ProductVariant } from "./models/product-ui.models";

export type { Product, ShopProductDetail, ShopProductDisplay } from "./types";
export type { ProductsSearchParams, ProductsSearchResult } from "./services/products.service";

export { useProductsQuery } from "./hooks/use-products-query";
export type { UseProductsQueryArgs } from "./hooks/use-products-query";
export { useInfiniteProductsQuery } from "./hooks/use-infinite-products-query";
export type { UseInfiniteProductsQueryArgs } from "./hooks/use-infinite-products-query";

export {
  catalogDetailToShopDisplay,
  mapApiProductToDetail,
  mapApiProductForLookupToDetail,
  mapApiProductToPreview,
  mapApiVariant,
  pickRelatedHints,
  previewToShopProductDisplay,
} from "./factories/walmart-product.factory";

export { extractWalmartItemsFromPayload } from "./lib/extract-walmart-items";
export { productsQueryKeys } from "./lib/products-query-keys";
export { productDetailPath } from "./lib/product-detail-route";

export { getProductDetail, getProducts, searchProducts } from "./services/products.service";

export { ProductCard } from "./ui/molecules/product-card";
export { ProductCardSkeleton } from "./ui/molecules/product-card-skeleton";
export { SearchBar } from "./ui/molecules/search-bar";

export { ProductDetailTemplate } from "./ui/templates/product-detail-template";
export { ProductDetailHero } from "./ui/organisms/product-detail-hero";
export { ProductInfoPanel } from "./ui/organisms/product-info-panel";
export { ProductsGrid } from "./ui/organisms/products-grid";
export { ProductsGridSkeleton } from "./ui/organisms/products-grid-skeleton";
export { DraggableProductsGrid } from "./ui/organisms/draggable-products-grid";
export { ProductsSection } from "./ui/organisms/products-section";
export { WalmartProductsCatalog } from "./ui/organisms/walmart-products-catalog";
export { VirtualizedDraggableProductsGrid } from "./ui/organisms/virtualized-draggable-products-grid";
export { RelatedProductsSection } from "./ui/organisms/related-products-section";
export { ShopHeader } from "./ui/organisms/shop-header";
