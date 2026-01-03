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

export const usersTable = tanstackSandboxSchema.table("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartTable = tanstackSandboxSchema.table("cart", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
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

export const orderStatuses = ["pending", "paid", "failed"] as const;

export const ordersTable = tanstackSandboxSchema.table("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  status: text({ enum: orderStatuses }).notNull(),
  total: integer("total").notNull(), // Total in cents
  currency: text("currency").notNull().default("usd"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItemsTable = tanstackSandboxSchema.table("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => ordersTable.id),
  pokemonId: integer("pokemon_id")
    .notNull()
    .references(() => pokemonTable.id),
  quantity: integer("quantity").notNull().default(1),
  price: integer("price").notNull(), // Price per item in cents at time of purchase
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stripeCustomerConnectionsTable = tanstackSandboxSchema.table("stripe_customer_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stripeOrdersTable = tanstackSandboxSchema.table("stripe_orders", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => ordersTable.id).notNull().unique(),
  checkoutSessionId: text("checkout_session_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Pokemon = typeof pokemonTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type Cart = typeof cartTable.$inferSelect;
export type CartItem = typeof cartItemsTable.$inferSelect;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type StripeCustomerConnection = typeof stripeCustomerConnectionsTable.$inferSelect;
export type StripeOrder = typeof stripeOrdersTable.$inferSelect;