import { httpClient } from "@/shared/api/http-client";
import { endpoints } from "@/shared/api/endpoints";
import type { CartLine } from "../types";

type CartResponse = {
  items: CartLine[];
};

export function fetchCart() {
  return httpClient<CartResponse>(endpoints.cart);
}
