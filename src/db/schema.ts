import { integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

export const pokemonTable = pgTable(
  "pokemon",
  {
    id: integer().notNull().primaryKey(),
    name: text().notNull(),
    likes: integer().notNull().default(0),
    types: text().array().notNull().default([]),
  },
  (table) => [uniqueIndex("name_idx").on(table.name)],
);

export type Pokemon = typeof pokemonTable.$inferSelect;
