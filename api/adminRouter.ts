import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export const adminRouter = createRouter({
  users: adminQuery.query(() => {
    return getDb().query.users.findMany();
  }),

  updateRole: adminQuery
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(({ input }) => {
      return getDb()
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
    }),
});
