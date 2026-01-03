import { auth } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import Stripe from "stripe";
import { z } from "zod";
import { getCartItems, getOrCreateUser } from "@/db";

const getStripeClient = createServerOnlyFn(
  () =>
    new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2025-12-15.clover",
    }),
);

export interface CheckoutLineItem {
  pokemonId: number;
  name: string;
  quantity: number;
  price: number; // Price in cents
}

async function createCheckoutSession(
  lineItems: CheckoutLineItem[],
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
) {
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price, // in cents
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: metadata || {},
  });

  return session;
}

const createCheckoutSessionInputSchema = z.object({
  cartId: z.number().positive("Cart ID must be positive"),
});

export const createCheckoutSessionFn = createServerFn({ method: "POST" })
  .inputValidator(createCheckoutSessionInputSchema)
  .handler(async ({ data }) => {
    const { userId: clerkUserId } = await auth();
    const cartItems = await getCartItems(data.cartId);

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Get user ID if authenticated
    let userId: number | null = null;
    if (clerkUserId) {
      const user = await getOrCreateUser(clerkUserId);
      userId = user.id;
    }

    // Build line items for Stripe
    const lineItems = cartItems.map((item) => ({
      pokemonId: item.pokemonId,
      name: item.pokemon.name,
      quantity: item.quantity,
      price: 500, // in cents
    }));

    const request = getRequest();
    const baseUrl = new URL(request.url).origin;
    const session = await createCheckoutSession(
      lineItems,
      `${baseUrl}/checkout/success`,
      `${baseUrl}/checkout/cancel`,
      {
        cartId: String(data.cartId),
        userId: userId ? String(userId) : "",
      },
    );

    return { url: session.url };
  });
