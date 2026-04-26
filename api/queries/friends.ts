import { getDb } from "./connection";
import { friendships } from "@db/schema";
import { eq, and, or } from "drizzle-orm";

export async function createFriendRequest(requesterId: number, addresseeId: number) {
  const db = getDb();
  // Prevent duplicate requests
  const existing = await db.query.friendships.findFirst({
    where: or(
      and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, addresseeId)),
      and(eq(friendships.requesterId, addresseeId), eq(friendships.addresseeId, requesterId))
    ),
  });
  if (existing) return existing;

  const [{ id }] = await db
    .insert(friendships)
    .values({ requesterId, addresseeId, status: "pending" })
    .$returningId();
  return db.query.friendships.findFirst({
    where: eq(friendships.id, id),
    with: { requester: true, addressee: true },
  });
}

export async function acceptFriendRequest(friendshipId: number, userId: number) {
  const db = getDb();
  const friendship = await db.query.friendships.findFirst({
    where: eq(friendships.id, friendshipId),
  });
  if (!friendship || friendship.addresseeId !== userId) return null;
  await db
    .update(friendships)
    .set({ status: "accepted" })
    .where(eq(friendships.id, friendshipId));
  return db.query.friendships.findFirst({
    where: eq(friendships.id, friendshipId),
    with: { requester: true, addressee: true },
  });
}

export async function removeFriendship(friendshipId: number) {
  await getDb().delete(friendships).where(eq(friendships.id, friendshipId));
}

export async function findFriendshipBetween(a: number, b: number) {
  return getDb().query.friendships.findFirst({
    where: or(
      and(eq(friendships.requesterId, a), eq(friendships.addresseeId, b)),
      and(eq(friendships.requesterId, b), eq(friendships.addresseeId, a))
    ),
  });
}

export async function listFriends(userId: number) {
  const db = getDb();
  const rows = await db.query.friendships.findMany({
    where: and(
      eq(friendships.status, "accepted"),
      or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId))
    ),
    with: { requester: true, addressee: true },
  });
  return rows;
}

export async function listPendingRequests(userId: number) {
  return getDb().query.friendships.findMany({
    where: and(eq(friendships.status, "pending"), eq(friendships.addresseeId, userId)),
    with: { requester: true, addressee: true },
  });
}

export async function listSentRequests(userId: number) {
  return getDb().query.friendships.findMany({
    where: and(eq(friendships.status, "pending"), eq(friendships.requesterId, userId)),
    with: { requester: true, addressee: true },
  });
}
