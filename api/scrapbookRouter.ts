import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import {
  createScrapbookPost,
  listScrapbookPostsByWall,
  deleteScrapbookPost,
} from "./queries/scrapbook";
import { createNotification } from "./queries/notifications";

export const scrapbookRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        wallUserId: z.number(),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await createScrapbookPost({
        wallUserId: input.wallUserId,
        authorId: ctx.user.id,
        content: input.content,
      });
      if (input.wallUserId !== ctx.user.id) {
        await createNotification({
          userId: input.wallUserId,
          type: "scrapbook",
          relatedId: post?.id,
          message: `${ctx.user.name || "Someone"} wrote on your scrapbook`,
        });
      }
      return post;
    }),

  list: publicQuery
    .input(z.object({ wallUserId: z.number() }))
    .query(({ input }) => listScrapbookPostsByWall(input.wallUserId)),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteScrapbookPost(input.id)),
});
