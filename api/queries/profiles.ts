import { getDb } from "./connection";
import { profiles, users } from "@db/schema";
import { eq, like, or, sql } from "drizzle-orm";

export async function findProfileByUserId(userId: number) {
  return getDb().query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    with: { user: true },
  });
}

export async function findProfileById(id: number) {
  return getDb().query.profiles.findFirst({
    where: eq(profiles.id, id),
    with: { user: true },
  });
}

export async function upsertProfile(data: {
  userId: number;
  bio?: string;
  interests?: string;
  favorites?: string;
  profileHtml?: string;
  profileCss?: string;
  backgroundUrl?: string;
  cursorStyle?: string;
  theme?: string;
  musicUrl?: string;
  musicAutoplay?: boolean;
  status?: string;
}) {
  const db = getDb();
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, data.userId),
  });
  if (existing) {
    await db.update(profiles).set(data).where(eq(profiles.id, existing.id));
    return db.query.profiles.findFirst({
      where: eq(profiles.id, existing.id),
      with: { user: true },
    });
  } else {
    const [{ id }] = await db.insert(profiles).values(data).$returningId();
    return db.query.profiles.findFirst({
      where: eq(profiles.id, id),
      with: { user: true },
    });
  }
}

export async function incrementProfileView(userId: number) {
  await getDb()
    .update(profiles)
    .set({ viewCount: sql`${profiles.viewCount} + 1` })
    .where(eq(profiles.userId, userId));
}

export async function updateOnlineStatus(userId: number, online: boolean) {
  await getDb()
    .update(profiles)
    .set({ online })
    .where(eq(profiles.userId, userId));
}

export async function searchUsers(query: string) {
  const pattern = `%${query}%`;
  return getDb()
    .select()
    .from(users)
    .where(or(like(users.name, pattern), like(users.email, pattern)))
    .limit(20);
}

export async function findAllUsers() {
  return getDb().query.users.findMany();
}
