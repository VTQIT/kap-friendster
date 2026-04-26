import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const profiles = mysqlTable("profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  bio: text("bio"),
  interests: text("interests"),
  favorites: text("favorites"),
  profileHtml: text("profileHtml"),
  profileCss: text("profileCss"),
  backgroundUrl: text("backgroundUrl"),
  cursorStyle: varchar("cursorStyle", { length: 255 }),
  theme: varchar("theme", { length: 255 }).default("default"),
  musicUrl: text("musicUrl"),
  musicAutoplay: boolean("musicAutoplay").default(true),
  viewCount: int("viewCount").default(0).notNull(),
  status: varchar("status", { length: 255 }),
  online: boolean("online").default(false),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export const friendships = mysqlTable(
  "friendships",
  {
    id: serial("id").primaryKey(),
    requesterId: bigint("requesterId", { mode: "number", unsigned: true }).notNull(),
    addresseeId: bigint("addresseeId", { mode: "number", unsigned: true }).notNull(),
    status: mysqlEnum("status", ["pending", "accepted"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    reqAddIdx: index("req_add_idx").on(table.requesterId, table.addresseeId),
  })
);

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;

export const testimonials = mysqlTable("testimonials", {
  id: serial("id").primaryKey(),
  profileUserId: bigint("profileUserId", { mode: "number", unsigned: true }).notNull(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

export const scrapbookPosts = mysqlTable("scrapbook_posts", {
  id: serial("id").primaryKey(),
  wallUserId: bigint("wallUserId", { mode: "number", unsigned: true }).notNull(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScrapbookPost = typeof scrapbookPosts.$inferSelect;
export type InsertScrapbookPost = typeof scrapbookPosts.$inferInsert;

export const privateMessages = mysqlTable("private_messages", {
  id: serial("id").primaryKey(),
  senderId: bigint("senderId", { mode: "number", unsigned: true }).notNull(),
  recipientId: bigint("recipientId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PrivateMessage = typeof privateMessages.$inferSelect;
export type InsertPrivateMessage = typeof privateMessages.$inferInsert;

export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  relatedId: bigint("relatedId", { mode: "number", unsigned: true }),
  message: text("message").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const topFriends = mysqlTable("top_friends", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  friendId: bigint("friendId", { mode: "number", unsigned: true }).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TopFriend = typeof topFriends.$inferSelect;
export type InsertTopFriend = typeof topFriends.$inferInsert;
