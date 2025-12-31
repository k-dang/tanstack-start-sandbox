import { createClientOnlyFn } from "@tanstack/react-start";

const CART_ID_KEY = "pokemon-cart-id";

export const getCartId = createClientOnlyFn((): number | null => {
  const cartId = localStorage.getItem(CART_ID_KEY);
  return cartId ? Number.parseInt(cartId, 10) : null;
});

export const setCartId = createClientOnlyFn((cartId: number): void => {
  localStorage.setItem(CART_ID_KEY, cartId.toString());
});
