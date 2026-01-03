import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getOrdersWithItems, getUserByClerkId } from "@/db";

const fetchOrders = createServerFn({ method: "GET" }).handler(async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }
  const user = await getUserByClerkId(userId);
  const orders = await getOrdersWithItems(user.id);
  return { orders };
});

export const Route = createFileRoute("/_authed/orders")({
  component: RouteComponent,
  loader: () => fetchOrders(),
});

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const formatPrice = (cents: number) => {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

function RouteComponent() {
  const { orders } = Route.useLoaderData();

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        <div className="text-center text-gray-600">
          <p className="text-lg">You haven't placed any orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                <p className="text-sm text-gray-600">{order.createdAt.toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatPrice(order.total)}</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium
                    rounded-full capitalize ${getStatusBadgeColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.pokemon.name} x {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
