import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { LockIcon, Package, ShoppingCart, UserIcon } from "lucide-react";
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
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="View cart">
              <Link to="/private">
                <LockIcon className="size-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="View cart">
              <Link to="/cart">
                <ShoppingCart className="size-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="View orders">
              <Link to="/orders">
                <Package className="size-5" />
              </Link>
            </Button>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="icon">
                  <UserIcon className="size-5" />
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </div>
  );
}
