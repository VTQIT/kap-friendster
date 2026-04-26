import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./queries/notifications";

export const notificationRouter = createRouter({
  list: authedQuery.query(({ ctx }) => listNotifications(ctx.user.id)),

  markRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => markNotificationRead(input.id, ctx.user.id)),

  markAllRead: authedQuery.mutation(({ ctx }) =>
    markAllNotificationsRead(ctx.user.id)
  ),
});
