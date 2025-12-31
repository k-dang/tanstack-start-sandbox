import { useMutation } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { addToCart, createCart } from "@/db";
import { getCartId, setCartId } from "@/lib/cart-utils";

const addPokemonToCart = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { cartId: number | null; pokemonId: number; quantity: number }) =>
      data,
  )
  .handler(async ({ data }) => {
    let cartId = data.cartId;
    if (!cartId) {
      const cart = await createCart();
      if (!cart?.id) {
        throw new Error("Failed to create cart");
      }
      cartId = cart.id;
    }
    await addToCart(cartId, data.pokemonId, data.quantity);
    return { success: true, cartId };
  });

// Hook to add Pokemon to cart
export function useAddToCart() {
  return useMutation({
    mutationFn: async ({
      pokemonId,
      quantity = 1,
    }: {
      pokemonId: number;
      quantity?: number;
    }) => {
      const cartId = getCartId();
      const result = await addPokemonToCart({
        data: { cartId, pokemonId, quantity },
      });
      if (result.cartId && !getCartId()) {
        setCartId(result.cartId);
      }
      return result;
    },
  });
}
