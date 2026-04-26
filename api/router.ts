import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { profileRouter } from "./profileRouter";
import { friendRouter } from "./friendRouter";
import { testimonialRouter } from "./testimonialRouter";
import { scrapbookRouter } from "./scrapbookRouter";
import { messageRouter } from "./messageRouter";
import { notificationRouter } from "./notificationRouter";
import { adminRouter } from "./adminRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  profile: profileRouter,
  friend: friendRouter,
  testimonial: testimonialRouter,
  scrapbook: scrapbookRouter,
  message: messageRouter,
  notification: notificationRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
