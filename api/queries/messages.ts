import { getDb } from "./connection";
import { privateMessages } from "@db/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";

export async function sendMessage(data: {
  senderId: number;
  recipientId: number;
  content: string;
}) {
  const db = getDb();
  const [{ id }] = await db.insert(privateMessages).values(data).$returningId();
  return db.query.privateMessages.findFirst({
    where: eq(privateMessages.id, id),
    with: { sender: true, recipient: true },
  });
}

export async function listConversations(userId: number) {
  const db = getDb();
  // Get latest message per conversation partner
  const allMessages = await db.query.privateMessages.findMany({
    where: or(
      eq(privateMessages.senderId, userId),
      eq(privateMessages.recipientId, userId)
    ),
    with: { sender: true, recipient: true },
    orderBy: desc(privateMessages.createdAt),
  });

  // Deduplicate by partner
  const seen = new Set<number>();
  const conversations = [];
  for (const msg of allMessages) {
    const partnerId = msg.senderId === userId ? msg.recipientId : msg.senderId;
    if (!seen.has(partnerId)) {
      seen.add(partnerId);
      conversations.push(msg);
    }
  }
  return conversations;
}

export async function listMessagesBetween(userId: number, partnerId: number) {
  return getDb().query.privateMessages.findMany({
    where: or(
      and(
        eq(privateMessages.senderId, userId),
        eq(privateMessages.recipientId, partnerId)
      ),
      and(
        eq(privateMessages.senderId, partnerId),
        eq(privateMessages.recipientId, userId)
      )
    ),
    with: { sender: true, recipient: true },
    orderBy: desc(privateMessages.createdAt),
  });
}

export async function markMessagesAsRead(recipientId: number, senderId: number) {
  await getDb()
    .update(privateMessages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(privateMessages.recipientId, recipientId),
        eq(privateMessages.senderId, senderId),
        sql`${privateMessages.readAt} IS NULL`
      )
    );
}
