import { useMutation } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { createCart, addToCart as dbAddToCart } from "@/db";

const CART_ID_KEY = "pokemon-cart-id";

const createCartFn = createServerFn({
  method: "POST",
}).handler(async () => await createCart());

const addPokemonToCartFn = createServerFn({ method: "POST" })
  .inputValidator((data: { cartId: number; pokemonId: number }) => data)
  .handler(async ({ data }) => {
    await dbAddToCart(data.cartId, data.pokemonId, 1);
    return { success: true };
  });

// Hook to manage cart ID from localStorage
export function useCart() {
  const getCartId = (): number | null => {
    if (typeof window === "undefined") return null;
    const cartId = localStorage.getItem(CART_ID_KEY);
    return cartId ? Number.parseInt(cartId, 10) : null;
  };

  const setCartId = (cartId: number) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CART_ID_KEY, cartId.toString());
  };

  const ensureCart = async () => {
    let cartId = getCartId();

    if (!cartId) {
      const cart = await createCartFn();
      if (cart?.id) {
        cartId = cart.id;
        setCartId(cartId);
      } else {
        throw new Error("Failed to create cart");
      }
    }

    return cartId;
  };

  return {
    cartId: getCartId(),
    ensureCart,
  };
}

// Hook to add Pokemon to cart
export function useAddToCart() {
  const { ensureCart } = useCart();

  return useMutation({
    mutationFn: async (pokemonId: number) => {
      const cartId = await ensureCart();
      await addPokemonToCartFn({ data: { cartId, pokemonId } });
      return { success: true };
    },
  });
}
