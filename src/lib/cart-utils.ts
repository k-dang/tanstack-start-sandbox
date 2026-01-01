import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

type CartSession = {
  cartId?: number;
};

function useCartSession() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET environment variable is required. Please set it in your .env file.",
    );
  }
  return useSession<CartSession>({
    name: "pokemon-cart",
    password: secret,
  });
}

export const getCartId = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useCartSession();
  return session.data.cartId ?? null;
});

export const setCartId = createServerFn({ method: "POST" })
  .inputValidator((cartId: number) => cartId)
  .handler(async ({ data: cartId }) => {
    const session = await useCartSession();
    await session.update({ cartId });
  });
