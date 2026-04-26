import { getDb } from "./connection";
import { testimonials } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export async function createTestimonial(data: {
  profileUserId: number;
  authorId: number;
  content: string;
}) {
  const db = getDb();
  const [{ id }] = await db.insert(testimonials).values(data).$returningId();
  return db.query.testimonials.findFirst({
    where: eq(testimonials.id, id),
    with: { author: true },
  });
}

export async function listTestimonialsByProfile(profileUserId: number) {
  return getDb().query.testimonials.findMany({
    where: eq(testimonials.profileUserId, profileUserId),
    with: { author: true },
    orderBy: desc(testimonials.createdAt),
  });
}

export async function deleteTestimonial(id: number) {
  await getDb().delete(testimonials).where(eq(testimonials.id, id));
}
