import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link to="/">
            <h1 className="text-3xl font-bold text-gray-900">Pokemon Shop</h1>
            <p className="text-gray-600 mt-1">Discover your favorite Pokemon</p>
          </Link>
          <Button asChild variant="ghost" size="icon" aria-label="View cart">
            <Link to="/cart">
              <ShoppingCart className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
