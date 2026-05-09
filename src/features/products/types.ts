export type Product = {
  id: string;
  name: string;
  price: number;
};

export type ShopProductDisplay = {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  /** Si existe, la tarjeta no formatea `price` como moneda */
  priceUnresolved?: boolean;
  currency?: string;
  badge?: string;
  imageSrc?: string;
};

export type ShopProductDetail = ShopProductDisplay & {
  description: string;
  sku: string;
  leadTimeMock?: string;
};
