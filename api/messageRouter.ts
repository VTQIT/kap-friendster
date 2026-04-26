import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  sendMessage,
  listConversations,
  listMessagesBetween,
  markMessagesAsRead,
} from "./queries/messages";
import { createNotification } from "./queries/notifications";

export const messageRouter = createRouter({
  send: authedQuery
    .input(
      z.object({
        recipientId: z.number(),
        content: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const msg = await sendMessage({
        senderId: ctx.user.id,
        recipientId: input.recipientId,
        content: input.content,
      });
      await createNotification({
        userId: input.recipientId,
        type: "message",
        relatedId: msg?.id,
        message: `New message from ${ctx.user.name || "Someone"}`,
      });
      return msg;
    }),

  conversations: authedQuery.query(({ ctx }) => listConversations(ctx.user.id)),

  thread: authedQuery
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ ctx, input }) => {
      await markMessagesAsRead(ctx.user.id, input.partnerId);
      return listMessagesBetween(ctx.user.id, input.partnerId);
    }),
});
