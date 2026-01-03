import { auth } from "@clerk/tanstack-react-start/server";
import { useMutation } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { addToCart, createCart } from "@/db";
import { getCartId, setCartId } from "@/lib/cart-utils";

const addPokemonToCart = createServerFn({ method: "POST" })
  .inputValidator((data: { pokemonId: number; quantity: number }) => data)
  .handler(async ({ data }) => {
    const { userId: clerkUserId } = await auth();
    let cartId = await getCartId();

    // If no cart exists, create one
    if (!cartId) {
      if (clerkUserId) {
        // For authenticated users, getCartId should have created a cart
        // This shouldn't happen, but handle it gracefully
        throw new Error("Failed to get or create user cart");
      } else {
        // For guests, create a session-based cart
        const cart = await createCart();
        if (!cart?.id) {
          throw new Error("Failed to create cart");
        }
        cartId = cart.id;
        await setCartId({ data: cartId });
      }
    }

    await addToCart(cartId, data.pokemonId, data.quantity);
    return { success: true, cartId };
  });

// Hook to add Pokemon to cart
export function useAddToCart() {
  return useMutation({
    mutationFn: async ({ pokemonId, quantity = 1 }: { pokemonId: number; quantity?: number }) => {
      return await addPokemonToCart({
        data: { pokemonId, quantity },
      });
    },
  });
}
