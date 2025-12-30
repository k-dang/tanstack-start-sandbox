import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import PokemonCard from "@/components/pokemon-card";
import { getRandomPokemon } from "@/db";

/*
const loggingMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    console.log("Request:", request.url);
    return next();
  }
);
const loggedServerFunction = createServerFn({ method: "GET" }).middleware([
  loggingMiddleware,
]);
*/

const getPokemon = createServerFn({
  method: "GET",
}).handler(async () => await getRandomPokemon());

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => await getPokemon(),
});

function App() {
  const pokemon = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pokemon.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No Pokemon available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {pokemon.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
