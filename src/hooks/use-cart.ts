import { useMutation } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { addToCart, createCart } from "@/db";
import { useCartSession } from "@/lib/session";

const addPokemonToCart = createServerFn({ method: "POST" })
  .inputValidator((data: { pokemonId: number; quantity: number }) => data)
  .handler(async ({ data }) => {
    const session = await useCartSession();
    let cartId = session.data.cartId;
    if (!cartId) {
      const cart = await createCart();
      if (!cart?.id) {
        throw new Error("Failed to create cart");
      }
      cartId = cart.id;
      await session.update({ cartId });
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
      return await addPokemonToCart({
        data: { pokemonId, quantity },
      });
    },
  });
}
