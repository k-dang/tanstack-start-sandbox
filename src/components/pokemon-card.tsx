import type { Pokemon } from "@/db/schema";

export default function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 border rounded-lg h-[140px] w-full">
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
        alt={pokemon.name}
        className="w-full h-full object-cover cursor-pointer duration-200 hover:scale-110"
      />
      <div className="text-gray-500 text-sm truncate w-full text-center overflow-hidden">
        {pokemon.name}
      </div>
    </div>
  );
}
