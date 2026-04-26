import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import {
  createTestimonial,
  listTestimonialsByProfile,
  deleteTestimonial,
} from "./queries/testimonials";
import { createNotification } from "./queries/notifications";

export const testimonialRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        profileUserId: z.number(),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const t = await createTestimonial({
        profileUserId: input.profileUserId,
        authorId: ctx.user.id,
        content: input.content,
      });
      await createNotification({
        userId: input.profileUserId,
        type: "testimonial",
        relatedId: t?.id,
        message: `${ctx.user.name || "Someone"} left a testimonial on your profile`,
      });
      return t;
    }),

  list: publicQuery
    .input(z.object({ profileUserId: z.number() }))
    .query(({ input }) => listTestimonialsByProfile(input.profileUserId)),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // In a real app, check if author or admin
      await deleteTestimonial(input.id);
    }),
});
