import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  cartItemsTable,
  cartTable,
  orderItemsTable,
  ordersTable,
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

export async function createOrder(
  userId: number | null,
  stripeSessionId: string,
  cartItems: Array<{
    pokemonId: number;
    quantity: number;
    price: number;
  }>,
) {
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const [order] = await db
    .insert(ordersTable)
    .values({
      userId: userId ?? null,
      stripeSessionId,
      status: "pending",
      total,
      updatedAt: sql`now()`,
    })
    .returning();

  if (!order) {
    throw new Error("Failed to create order");
  }

  // Insert order items
  await db.insert(orderItemsTable).values(
    cartItems.map((item) => ({
      orderId: order.id,
      pokemonId: item.pokemonId,
      quantity: item.quantity,
      price: item.price,
    })),
  );

  return order;
}

export async function getOrderByStripeSessionId(stripeSessionId: string) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.stripeSessionId, stripeSessionId))
    .limit(1);
  return order;
}

export async function updateOrderStatus(
  stripeSessionId: string,
  status: "pending" | "paid" | "failed",
) {
  const [order] = await db
    .update(ordersTable)
    .set({
      status,
      updatedAt: sql`now()`,
    })
    .where(eq(ordersTable.stripeSessionId, stripeSessionId))
    .returning();
  return order;
}

export async function getOrdersByUserId(userId: number) {
  return await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, userId))
    .orderBy(sql`${ordersTable.createdAt} DESC`);
}

export async function getOrderWithItems(orderId: number) {
  const order = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order[0]) {
    return null;
  }

  const items = await db
    .select({
      id: orderItemsTable.id,
      orderId: orderItemsTable.orderId,
      pokemonId: orderItemsTable.pokemonId,
      quantity: orderItemsTable.quantity,
      price: orderItemsTable.price,
      createdAt: orderItemsTable.createdAt,
      pokemon: {
        id: pokemonTable.id,
        name: pokemonTable.name,
        likes: pokemonTable.likes,
        types: pokemonTable.types,
      },
    })
    .from(orderItemsTable)
    .innerJoin(pokemonTable, eq(orderItemsTable.pokemonId, pokemonTable.id))
    .where(eq(orderItemsTable.orderId, orderId));

  return {
    ...order[0],
    items,
  };
}
