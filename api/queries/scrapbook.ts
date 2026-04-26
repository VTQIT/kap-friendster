import { getDb } from "./connection";
import { scrapbookPosts } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export async function createScrapbookPost(data: {
  wallUserId: number;
  authorId: number;
  content: string;
}) {
  const db = getDb();
  const [{ id }] = await db.insert(scrapbookPosts).values(data).$returningId();
  return db.query.scrapbookPosts.findFirst({
    where: eq(scrapbookPosts.id, id),
    with: { author: true },
  });
}

export async function listScrapbookPostsByWall(wallUserId: number) {
  return getDb().query.scrapbookPosts.findMany({
    where: eq(scrapbookPosts.wallUserId, wallUserId),
    with: { author: true },
    orderBy: desc(scrapbookPosts.createdAt),
  });
}

export async function deleteScrapbookPost(id: number) {
  await getDb().delete(scrapbookPosts).where(eq(scrapbookPosts.id, id));
}
