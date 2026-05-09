export type WalmartImageInfo = {
  thumbnailUrl?: string;
};

export type WalmartAvailabilityStatusV2 = {
  display?: string;
};

export type WalmartVariant = {
  usItemId?: string | number;
  name?: string;
  image?: string;
  price?: number | string;
};

export type WalmartApiProduct = {
  usItemId?: string | number;
  name?: string;
  image?: string;
  price?: number | string;
  shortDescription?: string;
  canonicalUrl?: string;
  sellerName?: string;
  averageRating?: number;
  numberOfReviews?: number;
  availabilityStatusV2?: WalmartAvailabilityStatusV2;
  imageInfo?: WalmartImageInfo;
  variantList?: WalmartVariant[];
};

export type WalmartItemStack = {
  items?: WalmartApiProduct[];
};

export type WalmartSearchResult = {
  itemStacks?: WalmartItemStack[];
};

export type WalmartInitialData = {
  searchResult?: WalmartSearchResult;
};

export type WalmartPagePropsShape = {
  initialData?: WalmartInitialData;
};

export type WalmartProductsResponse = {
  props?: {
    pageProps?: WalmartPagePropsShape;
  };
};
