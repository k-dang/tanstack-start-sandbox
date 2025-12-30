import {
  integer,
  pgSchema,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const tanstackSandboxSchema = pgSchema("tanstack_sandbox");

export const pokemonTable = tanstackSandboxSchema.table(
  "pokemon",
  {
    id: integer().notNull().primaryKey(),
    name: text().notNull(),
    likes: integer().notNull().default(0),
    types: text().array().notNull().default([]),
  },
  (table) => [uniqueIndex("name_idx").on(table.name)],
);

export const cartTable = tanstackSandboxSchema.table("cart", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartItemsTable = tanstackSandboxSchema.table(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    cartId: integer("cart_id")
      .notNull()
      .references(() => cartTable.id),
    pokemonId: integer("pokemon_id")
      .notNull()
      .references(() => pokemonTable.id),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("cart_pokemon_idx").on(table.cartId, table.pokemonId),
  ],
);

export type Pokemon = typeof pokemonTable.$inferSelect;
export type Cart = typeof cartTable.$inferSelect;
export type CartItem = typeof cartItemsTable.$inferSelect; 