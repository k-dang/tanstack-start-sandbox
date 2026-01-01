import { useSession } from "@tanstack/react-start/server";

type CartSession = {
  cartId?: number;
};

export function useCartSession() {
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
