export type ProductImage = {
  url: string;
  thumbnailUrl?: string;
};

export type ProductVariant = {
  id: string;
  name: string;
  price: number | null;
  imageUrl?: string;
};

export type ProductPreview = {
  id: string;
  name: string;
  price: number;
  /** true si no encontramos un precio fiable en el JSON (solo mostramos texto en UI). */
  priceUnresolved?: boolean;
  currency: string;
  shortDescription: string | null;
  canonicalUrl: string | null;
  sellerName: string | null;
  averageRating: number | null;
  numberOfReviews: number | null;
  availabilityDisplay: string | null;
  image: ProductImage;
  variants: ProductVariant[];
};

export type ProductDetail = ProductPreview & {
  longDescription: string | null;
  gallery: ProductImage[];
  walmartUrl: string | null;
  brandText: string | null;
  categoryText: string | null;
  relatedSearchHints: readonly string[];
};
