import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createFriendRequest,
  acceptFriendRequest,
  removeFriendship,
  listFriends,
  listPendingRequests,
  listSentRequests,
  findFriendshipBetween,
} from "./queries/friends";
import { createNotification } from "./queries/notifications";

export const friendRouter = createRouter({
  request: authedQuery
    .input(z.object({ addresseeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const req = await createFriendRequest(ctx.user.id, input.addresseeId);
      if (req && req.status === "pending" && req.requesterId === ctx.user.id) {
        await createNotification({
          userId: input.addresseeId,
          type: "friend_request",
          relatedId: req.id,
          message: `${ctx.user.name || "Someone"} sent you a friend request`,
        });
      }
      return req;
    }),

  accept: authedQuery
    .input(z.object({ friendshipId: z.number() }))
    .mutation(({ ctx, input }) => acceptFriendRequest(input.friendshipId, ctx.user.id)),

  remove: authedQuery
    .input(z.object({ friendshipId: z.number() }))
    .mutation(({ input }) => removeFriendship(input.friendshipId)),

  list: authedQuery.query(({ ctx }) => listFriends(ctx.user.id)),

  pending: authedQuery.query(({ ctx }) => listPendingRequests(ctx.user.id)),

  sent: authedQuery.query(({ ctx }) => listSentRequests(ctx.user.id)),

  status: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(({ ctx, input }) => findFriendshipBetween(ctx.user.id, input.userId)),
});
