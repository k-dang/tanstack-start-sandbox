import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { getCartItems, removeFromCart, updateCartQuantity } from "@/db";
import { createCheckoutSessionFn } from "@/integrations/stripe";
import { getCartId } from "@/lib/cart-utils";

const getCartItemsInputSchema = z.object({
  cartId: z.number().nullable(),
});

const getCartItemsFn = createServerFn({ method: "GET" })
  .inputValidator(getCartItemsInputSchema)
  .handler(async ({ data }) => {
    if (!data.cartId) return [];
    return await getCartItems(data.cartId);
  });

const removeFromCartInputSchema = z.object({
  cartId: z.number().positive("Cart ID must be positive"),
  pokemonId: z.number().positive("Pokemon ID must be positive"),
});

const removeFromCartFn = createServerFn({ method: "POST" })
  .inputValidator(removeFromCartInputSchema)
  .handler(async ({ data }) => {
    await removeFromCart(data.cartId, data.pokemonId);
    return { success: true };
  });

const updateCartQuantityInputSchema = z.object({
  cartId: z.number().positive("Cart ID must be positive"),
  pokemonId: z.number().positive("Pokemon ID must be positive"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const updateCartQuantityFn = createServerFn({ method: "POST" })
  .inputValidator(updateCartQuantityInputSchema)
  .handler(async ({ data }) => {
    await updateCartQuantity(data.cartId, data.pokemonId, data.quantity);
    return { success: true };
  });

export const Route = createFileRoute("/cart")({
  component: CartComponent,
  pendingComponent: () => <div>Loading cart...</div>,
  loader: async () => {
    const cartId = await getCartId();
    const cartItems = await getCartItemsFn({ data: { cartId } });
    return { cartId, cartItems };
  },
});

function CartComponent() {
  const router = useRouter();
  const { cartId, cartItems } = Route.useLoaderData();

  const removeMutation = useMutation({
    mutationFn: (pokemonId: number) => {
      if (!cartId) throw new Error("Cart ID is required");
      return removeFromCartFn({ data: { cartId, pokemonId } });
    },
    onSuccess: () => {
      router.invalidate();
      toast.success("Item removed from cart");
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({
      pokemonId,
      quantity,
    }: {
      pokemonId: number;
      quantity: number;
    }) => {
      if (!cartId) throw new Error("Cart ID is required");
      return updateCartQuantityFn({
        data: { cartId, pokemonId, quantity },
      });
    },
    onSuccess: () => {
      router.invalidate();
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!cartId) throw new Error("Cart ID is required");
      const result = await createCheckoutSessionFn({ data: { cartId } });
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start checkout");
    },
  });

  const handleRemove = (pokemonId: number) => {
    removeMutation.mutate(pokemonId);
  };

  const handleQuantityChange = (pokemonId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove(pokemonId);
      return;
    }
    updateQuantityMutation.mutate({ pokemonId, quantity: newQuantity });
  };

  const handleCheckout = () => {
    checkoutMutation.mutate();
  };

  if (cartItems.length === 0) {
    return (
      <div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart</h2>
          <p className="text-gray-500">
            Your cart is empty. Add some Pokemon to get started!
          </p>
        </div>
      </div>
    );
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + 5 * item.quantity,
    0,
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Cart</h2>
        <p className="text-gray-600">
          {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-6">
              {/* Pokemon Image */}
              <div className="shrink-0">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.pokemon.id}.png`}
                  alt={item.pokemon.name}
                  className="w-24 h-24 object-contain"
                />
              </div>

              {/* Pokemon Info */}
              <div className="grow">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  #{String(item.pokemon.id).padStart(3, "0")}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 capitalize mb-2">
                  {item.pokemon.name}
                </h3>
                {item.pokemon.types.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {item.pokemon.types.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded capitalize"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() =>
                      handleQuantityChange(item.pokemonId, item.quantity - 1)
                    }
                    disabled={
                      removeMutation.isPending ||
                      updateQuantityMutation.isPending
                    }
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-medium text-gray-900 min-w-8 text-center">
                    {item.quantity}
                  </span>
                  <Button
                    onClick={() =>
                      handleQuantityChange(item.pokemonId, item.quantity + 1)
                    }
                    disabled={
                      removeMutation.isPending ||
                      updateQuantityMutation.isPending
                    }
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Remove Button */}
                <Button
                  onClick={() => handleRemove(item.pokemonId)}
                  disabled={
                    removeMutation.isPending || updateQuantityMutation.isPending
                  }
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label="Remove from cart"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-gray-900">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
        <Button
          onClick={handleCheckout}
          disabled={checkoutMutation.isPending || checkoutMutation.isSuccess}
          className="w-full"
          size="lg"
        >
          <ShoppingBag className="h-5 w-5" />
          {checkoutMutation.isPending || checkoutMutation.isSuccess
            ? "Processing..."
            : "Checkout"}
        </Button>
      </div>
    </div>
  );
}
