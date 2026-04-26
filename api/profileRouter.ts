import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import {
  findProfileByUserId,
  upsertProfile,
  incrementProfileView,
  updateOnlineStatus,
  searchUsers,
  findAllUsers,
} from "./queries/profiles";

export const profileRouter = createRouter({
  getByUserId: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const profile = await findProfileByUserId(input.userId);
      if (profile) {
        await incrementProfileView(input.userId);
      }
      return profile;
    }),

  me: authedQuery.query(({ ctx }) => findProfileByUserId(ctx.user.id)),

  update: authedQuery
    .input(
      z.object({
        bio: z.string().optional(),
        interests: z.string().optional(),
        favorites: z.string().optional(),
        profileHtml: z.string().optional(),
        profileCss: z.string().optional(),
        backgroundUrl: z.string().optional(),
        cursorStyle: z.string().optional(),
        theme: z.string().optional(),
        musicUrl: z.string().optional(),
        musicAutoplay: z.boolean().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      upsertProfile({ userId: ctx.user.id, ...input })
    ),

  search: publicQuery
    .input(z.object({ query: z.string().min(1) }))
    .query(({ input }) => searchUsers(input.query)),

  setOnline: authedQuery
    .input(z.object({ online: z.boolean() }))
    .mutation(({ ctx, input }) => updateOnlineStatus(ctx.user.id, input.online)),

  listAll: adminQuery.query(() => findAllUsers()),
});
