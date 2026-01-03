import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { getOrderByStripeSessionId, getOrderWithItems } from "@/db";

const getOrderInputSchema = z.object({
  sessionId: z.string().optional(),
});

const getOrderFn = createServerFn({ method: "GET" })
  .inputValidator(getOrderInputSchema)
  .handler(async ({ data }) => {
    if (!data.sessionId) {
      return null;
    }

    const order = await getOrderByStripeSessionId(data.sessionId);
    if (!order) {
      return null;
    }

    return await getOrderWithItems(order.id);
  });

export const Route = createFileRoute("/checkout/success")({
  component: SuccessComponent,
  validateSearch: z.object({
    session_id: z.string().optional(),
  }),
  loaderDeps: ({ search }) => ({ sessionId: search.session_id }),
  loader: async ({ deps }) => {
    const order = await getOrderFn({ data: { sessionId: deps.sessionId } });
    return { order };
  },
});

function SuccessComponent() {
  const { order } = Route.useLoaderData();

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Order Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't find your order. Please contact support if you believe
          this is an error.
        </p>
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  const totalPrice = order.total / 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been received and is being
          processed.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Order Details
        </h2>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order ID</span>
            <span className="font-medium text-gray-900">#{order.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status</span>
            <span className="font-medium capitalize text-green-600">
              {order.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date</span>
            <span className="font-medium text-gray-900">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Items Purchased
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.pokemon.id}.png`}
                    alt={item.pokemon.name}
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {item.pokemon.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Button asChild variant="outline">
          <Link to="/">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link to="/cart">
            <ShoppingBag className="h-4 w-4 mr-2" />
            View Cart
          </Link>
        </Button>
      </div>
    </div>
  );
}
