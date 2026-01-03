import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import {
  clearCart,
  getOrderById,
  getStripeOrder,
  updateOrderStatus,
} from "@/db";
import { getStripeClient } from "@/integrations/stripe";

export const Route = createFileRoute("/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          console.error("Missing stripe-signature header");
          return new Response("Invalid signature", { status: 400 });
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
          console.error("Missing STRIPE_WEBHOOK_SECRET");
          return new Response("Webhook secret not configured", { status: 500 });
        }

        const stripe = getStripeClient();

        try {
          const body = await request.text();
          const event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret,
          );

          if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const sessionId = session.id;

            console.log(`Payment successful for session: ${sessionId}`);

            const stripeOrder = await getStripeOrder(sessionId);
            if (!stripeOrder) {
              console.error(`Stripe order not found for session: ${sessionId}`);
              return new Response("Stripe order not found", { status: 500 });
            }

            const order = await getOrderById(stripeOrder.orderId);
            if (!order) {
              console.error(`Order not found for session: ${sessionId}`);
              return new Response("Order not found", { status: 500 });
            }

            // these 2 can be done in parallel
            const updateOrderTask = updateOrderStatus(order.id, "paid");
            console.log(`Order #${order.id} marked as paid`);

            await stripe.checkout.sessions.retrieve(sessionId);
            const cartId = parseInt(session.metadata?.cartId ?? "0", 10);
            if (cartId) {
              await clearCart(cartId);
              console.log(`Cart #${cartId} cleared`);
            } else {
              console.error(`Cart ID not found for session: ${sessionId}`);
            }

            await updateOrderTask;
          } else {
            console.log(`Unhandled event type: ${event.type}`);
          }

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          console.error("Webhook error:", error);

          if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
            return new Response("Invalid signature", { status: 400 });
          }

          return new Response("Webhook handler failed", { status: 500 });
        }
      },
    },
  },
});
