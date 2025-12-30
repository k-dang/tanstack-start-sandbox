import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { pokemonTable } from "@/db/schema";

// biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is required for app to function
const db = drizzle(process.env.DATABASE_URL!);

export async function getRandomPokemon(limit = 12) {
  return await db
    .select()
    .from(pokemonTable)
    .orderBy(sql`RANDOM()`)
    .limit(limit);
}
