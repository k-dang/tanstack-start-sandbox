import { Button } from "@/components/ui/button";
import type { Pokemon } from "@/db/schema";
import { useAddToCart } from "@/hooks/use-cart";

export default function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  const { isPending, mutate } = useAddToCart();

  const handleAddToCart = () => {
    mutate(pokemon.id);
  };

  return (
    <div className="group relative flex flex-col items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Background gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50 group-hover:via-purple-50 group-hover:to-pink-50 transition-all duration-300" />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center gap-2">
        {/* Pokemon Image Container */}
        <div className="relative w-full aspect-square flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 rounded-lg p-3 group-hover:bg-linear-to-br group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-300">
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
            alt={pokemon.name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>

        {/* Pokemon Name and ID */}
        <div className="w-full text-center space-y-1">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            #{String(pokemon.id).padStart(3, "0")}
          </div>
          <div className="text-sm font-semibold text-gray-800 capitalize truncate w-full group-hover:text-blue-600 transition-colors duration-300">
            {pokemon.name}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isPending}
          variant="default"
          size="sm"
          className="w-full mt-2"
        >
          {isPending ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
