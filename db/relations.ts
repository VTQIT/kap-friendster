import { relations } from "drizzle-orm";
import {
  users,
  profiles,
  friendships,
  testimonials,
  scrapbookPosts,
  privateMessages,
  notifications,
  topFriends,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  sentFriendRequests: many(friendships, { relationName: "requester" }),
  receivedFriendRequests: many(friendships, { relationName: "addressee" }),
  testimonialsReceived: many(testimonials, { relationName: "profileUser" }),
  testimonialsWritten: many(testimonials, { relationName: "author" }),
  wallPosts: many(scrapbookPosts, { relationName: "wallUser" }),
  scrapbookEntries: many(scrapbookPosts, { relationName: "author" }),
  sentMessages: many(privateMessages, { relationName: "sender" }),
  receivedMessages: many(privateMessages, { relationName: "recipient" }),
  notifications: many(notifications),
  topFriends: many(topFriends, { relationName: "owner" }),
  topFriendOf: many(topFriends, { relationName: "friend" }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: "addressee",
  }),
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  profileUser: one(users, {
    fields: [testimonials.profileUserId],
    references: [users.id],
    relationName: "profileUser",
  }),
  author: one(users, {
    fields: [testimonials.authorId],
    references: [users.id],
    relationName: "author",
  }),
}));

export const scrapbookPostsRelations = relations(scrapbookPosts, ({ one }) => ({
  wallUser: one(users, {
    fields: [scrapbookPosts.wallUserId],
    references: [users.id],
    relationName: "wallUser",
  }),
  author: one(users, {
    fields: [scrapbookPosts.authorId],
    references: [users.id],
    relationName: "author",
  }),
}));

export const privateMessagesRelations = relations(privateMessages, ({ one }) => ({
  sender: one(users, {
    fields: [privateMessages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  recipient: one(users, {
    fields: [privateMessages.recipientId],
    references: [users.id],
    relationName: "recipient",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const topFriendsRelations = relations(topFriends, ({ one }) => ({
  owner: one(users, {
    fields: [topFriends.userId],
    references: [users.id],
    relationName: "owner",
  }),
  friend: one(users, {
    fields: [topFriends.friendId],
    references: [users.id],
    relationName: "friend",
  }),
}));
