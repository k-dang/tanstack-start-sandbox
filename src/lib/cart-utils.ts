import { createServerFn } from "@tanstack/react-start";
import { useCartSession } from "@/lib/session";

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
