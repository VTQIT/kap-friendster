import { getDb } from "./connection";
import { notifications } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function createNotification(data: {
  userId: number;
  type: string;
  relatedId?: number;
  message: string;
}) {
  const db = getDb();
  const [{ id }] = await db.insert(notifications).values(data).$returningId();
  return db.query.notifications.findFirst({
    where: eq(notifications.id, id),
    with: { user: true },
  });
}

export async function listNotifications(userId: number) {
  return getDb().query.notifications.findMany({
    where: eq(notifications.userId, userId),
    with: { user: true },
    orderBy: desc(notifications.createdAt),
  });
}

export async function markNotificationRead(id: number, userId: number) {
  await getDb()
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  await getDb()
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), sql`${notifications.readAt} IS NULL`));
}
