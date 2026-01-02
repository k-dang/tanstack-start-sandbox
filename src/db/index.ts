import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  cartItemsTable,
  cartTable,
  pokemonTable,
  usersTable,
} from "@/db/schema";

// biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is required for app to function
const db = drizzle(process.env.DATABASE_URL!);

export async function getRandomPokemon(limit = 12) {
  return await db
    .select()
    .from(pokemonTable)
    .orderBy(sql`RANDOM()`)
    .limit(limit);
}

export async function getOrCreateUser(clerkId: string) {
  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);

  if (existingUser) {
    return existingUser;
  }

  const [newUser] = await db
    .insert(usersTable)
    .values({
      clerkId,
      updatedAt: sql`now()`,
    })
    .returning();

  return newUser;
}

export async function getUserCart(userId: number) {
  const [cart] = await db
    .select()
    .from(cartTable)
    .where(eq(cartTable.userId, userId))
    .limit(1);
  return cart;
}

export async function createCartForUser(userId: number) {
  const [cart] = await db
    .insert(cartTable)
    .values({
      userId,
      updatedAt: sql`now()`,
    })
    .returning();
  return cart;
}

export async function mergeGuestCartToUser(
  guestCartId: number,
  userId: number,
) {
  // Get user's existing cart or create one
  let userCart = await getUserCart(userId);
  if (!userCart) {
    userCart = await createCartForUser(userId);
    if (!userCart?.id) {
      throw new Error("Failed to create user cart");
    }
  }

  // Get guest cart items
  const guestItems = await getCartItems(guestCartId);

  // Merge items into user cart
  for (const item of guestItems) {
    await addToCart(userCart.id, item.pokemonId, item.quantity);
  }

  // Delete guest cart items
  await clearCart(guestCartId);

  // Delete guest cart
  await db.delete(cartTable).where(eq(cartTable.id, guestCartId));

  return userCart;
}

export async function createCart() {
  const [cart] = await db
    .insert(cartTable)
    .values({
      updatedAt: sql`now()`,
    })
    .returning();
  return cart;
}

export async function getCart(cartId: number) {
  const [cart] = await db
    .select()
    .from(cartTable)
    .where(eq(cartTable.id, cartId));
  return cart;
}

export async function addToCart(
  cartId: number,
  pokemonId: number,
  quantity: number = 1,
) {
  // Update cart's updatedAt timestamp
  await db
    .update(cartTable)
    .set({ updatedAt: sql`now()` })
    .where(eq(cartTable.id, cartId));

  return await db
    .insert(cartItemsTable)
    .values({
      cartId,
      pokemonId,
      quantity,
      updatedAt: sql`now()`,
    })
    .onConflictDoUpdate({
      target: [cartItemsTable.cartId, cartItemsTable.pokemonId],
      set: {
        quantity: sql`${cartItemsTable.quantity} + excluded.quantity`,
        updatedAt: sql`now()`,
      },
    });
}

export async function removeFromCart(cartId: number, pokemonId: number) {
  // Update cart's updatedAt timestamp
  await db
    .update(cartTable)
    .set({ updatedAt: sql`now()` })
    .where(eq(cartTable.id, cartId));

  return await db
    .delete(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.cartId, cartId),
        eq(cartItemsTable.pokemonId, pokemonId),
      ),
    );
}

export async function getCartItems(cartId: number) {
  return await db
    .select({
      id: cartItemsTable.id,
      cartId: cartItemsTable.cartId,
      pokemonId: cartItemsTable.pokemonId,
      quantity: cartItemsTable.quantity,
      createdAt: cartItemsTable.createdAt,
      updatedAt: cartItemsTable.updatedAt,
      pokemon: {
        id: pokemonTable.id,
        name: pokemonTable.name,
        likes: pokemonTable.likes,
        types: pokemonTable.types,
      },
    })
    .from(cartItemsTable)
    .innerJoin(pokemonTable, eq(cartItemsTable.pokemonId, pokemonTable.id))
    .where(eq(cartItemsTable.cartId, cartId));
}

export async function updateCartQuantity(
  cartId: number,
  pokemonId: number,
  quantity: number,
) {
  // Update cart's updatedAt timestamp
  await db
    .update(cartTable)
    .set({ updatedAt: sql`now()` })
    .where(eq(cartTable.id, cartId));

  return await db
    .update(cartItemsTable)
    .set({
      quantity,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(cartItemsTable.cartId, cartId),
        eq(cartItemsTable.pokemonId, pokemonId),
      ),
    );
}

export async function clearCart(cartId: number) {
  // Update cart's updatedAt timestamp
  await db
    .update(cartTable)
    .set({ updatedAt: sql`now()` })
    .where(eq(cartTable.id, cartId));

  return await db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.cartId, cartId));
}
