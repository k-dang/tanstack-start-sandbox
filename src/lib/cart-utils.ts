import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { createCartForUser, getOrCreateUser, getUserCart } from "@/db";
import { useCartSession } from "@/lib/session";

export const getCartId = createServerFn({ method: "GET" }).handler(async () => {
  const { userId: clerkUserId } = await auth();

  // If authenticated, use user's cart
  if (clerkUserId) {
    const user = await getOrCreateUser(clerkUserId);
    let cart = await getUserCart(user.id);
    if (!cart) {
      cart = await createCartForUser(user.id);
    }
    return cart?.id ?? null;
  }

  // biome-ignore lint/correctness/useHookAtTopLevel: <TanStack Start docs do this as well>
  const session = await useCartSession();
  // Fall back to session-based cart for guests
  return session.data.cartId ?? null;
});

export const setCartId = createServerFn({ method: "POST" })
  .inputValidator((cartId: number) => cartId)
  .handler(async ({ data: cartId }) => {
    const session = await useCartSession();
    await session.update({ cartId });
  });
