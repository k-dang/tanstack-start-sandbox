import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout/cancel")({
  component: CancelComponent,
});

function CancelComponent() {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Checkout Cancelled
      </h1>
      <p className="text-gray-600 mb-8">
        Your checkout was cancelled. No charges were made. Your items are still
        in your cart.
      </p>
      <div className="flex gap-4 justify-center">
        <Button asChild variant="outline">
          <Link to="/">Return Home</Link>
        </Button>
        <Button asChild>
          <Link to="/cart">Return to Cart</Link>
        </Button>
      </div>
    </div>
  );
}
