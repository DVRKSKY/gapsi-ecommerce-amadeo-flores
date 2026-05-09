export type CartLine = {
  id: string;
  productId: string;
  quantity: number;
};

export type CartLineDisplay = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  currency?: string;
  imageSrc?: string;
};
