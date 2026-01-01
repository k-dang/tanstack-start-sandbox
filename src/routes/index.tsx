import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { RefreshCw } from "lucide-react";
import PokemonCard from "@/components/pokemon-card";
import { Button } from "@/components/ui/button";
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
  loader: () => getPokemon(),
  staleTime: Infinity, // disable swr
});

function App() {
  const pokemon = Route.useLoaderData();
  const router = useRouter();

  return (
    <div>
      {pokemon.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No Pokemon available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => router.invalidate()}>
              <RefreshCw className="size-4" /> Refresh
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pokemon.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
