import { getDb } from "../api/queries/connection";
import { users, profiles, friendships, testimonials, scrapbookPosts, privateMessages, notifications } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Insert demo users
  const userValues = [
    { unionId: "demo_user_1", name: "xXGlitterGurlXx", email: "glitter@friendster.demo", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Glitter" },
    { unionId: "demo_user_2", name: "Sk8erBoi99", email: "sk8er@friendster.demo", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sk8er" },
    { unionId: "demo_user_3", name: "EmoKid2004", email: "emo@friendster.demo", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Emo" },
    { unionId: "demo_user_4", name: "RaverChick", email: "raver@friendster.demo", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Raver" },
    { unionId: "demo_user_5", name: "CyberPunk_Dave", email: "dave@friendster.demo", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Dave" },
  ];

  const createdUsers = [] as { id: number; name: string }[];
  for (const u of userValues) {
    const existing = await db.query.users.findFirst({ where: (table, { eq }) => eq(table.unionId, u.unionId) });
    if (existing) {
      createdUsers.push(existing);
      continue;
    }
    const [{ id }] = await db.insert(users).values(u).$returningId();
    const inserted = await db.query.users.findFirst({ where: (table, { eq }) => eq(table.id, id) });
    if (inserted) createdUsers.push(inserted);
  }

  const [u1, u2, u3, u4, u5] = createdUsers;

  // Insert profiles
  const profileData = [
    { userId: u1.id, bio: "Heyy!! welcome 2 my page!! I luv glitter and hot pink!!", interests: "Boys, Mall, MySpace, AIM", favorites: "Color: Pink | Band: Britney | Movie: Mean Girls", theme: "pink", musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", musicAutoplay: true, status: "~*~*~ glitter forever ~*~*~", viewCount: 420 },
    { userId: u2.id, bio: "Sup. I skate and listen 2 punk rock.", interests: "Skating, Guitar, Video Games", favorites: "Color: Black | Band: Blink-182 | Game: Tony Hawk", theme: "default", musicUrl: "", musicAutoplay: false, status: "sk8 or die", viewCount: 1337 },
    { userId: u3.id, bio: "Life is pain. Welcome to my darkness.", interests: "Poetry, Crying, eyeliner", favorites: "Color: Midnight | Band: MCR | Movie: Donnie Darko", theme: "dark", musicUrl: "", musicAutoplay: false, status: "nobody understands me", viewCount: 69 },
    { userId: u4.id, bio: "PLUR!! Dance dance dance!!", interests: "Raving, Glowsticks, EDM", favorites: "Color: Neon | DJ: Tiesto | Movie: Groove", theme: "cyber", musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", musicAutoplay: true, status: "keep the vibe alive", viewCount: 9001 },
    { userId: u5.id, bio: "Hacker in training. Linux ftw.", interests: "Coding, Sci-fi, Anime", favorites: "Color: Green | Band: Daft Punk | Anime: Akira", theme: "default", musicUrl: "", musicAutoplay: false, status: "rm -rf /boredom", viewCount: 404 },
  ];

  for (const p of profileData) {
    const existing = await db.query.profiles.findFirst({ where: (table, { eq }) => eq(table.userId, p.userId) });
    if (!existing) {
      await db.insert(profiles).values(p);
    }
  }

  // Friendships
  const friendPairs = [
    { requesterId: u1.id, addresseeId: u2.id, status: "accepted" },
    { requesterId: u1.id, addresseeId: u4.id, status: "accepted" },
    { requesterId: u2.id, addresseeId: u3.id, status: "pending" },
    { requesterId: u5.id, addresseeId: u1.id, status: "pending" },
    { requesterId: u3.id, addresseeId: u4.id, status: "accepted" },
  ];

  for (const f of friendPairs) {
    const existing = await db.query.friendships.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.requesterId, f.requesterId), eq(table.addresseeId, f.addresseeId)),
    });
    if (!existing) {
      await db.insert(friendships).values(f);
    }
  }

  // Testimonials
  const tData = [
    { profileUserId: u1.id, authorId: u2.id, content: "ur page is sooo kewl!! glitter 4 lyfe!!" },
    { profileUserId: u1.id, authorId: u4.id, content: "love the vibe girl!! lets rave sometime!!" },
    { profileUserId: u2.id, authorId: u1.id, content: "sk8er boi 4ever!! rock on!!" },
    { profileUserId: u3.id, authorId: u4.id, content: "stay dark my friend. the night is young." },
  ];

  for (const t of tData) {
    const existing = await db.query.testimonials.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.profileUserId, t.profileUserId), eq(table.authorId, t.authorId), eq(table.content, t.content)),
    });
    if (!existing) {
      await db.insert(testimonials).values(t);
    }
  }

  // Scrapbook posts
  const sData = [
    { wallUserId: u1.id, authorId: u2.id, content: "hey glitter!! thx 4 the add!!" },
    { wallUserId: u1.id, authorId: u4.id, content: "profile song is fire!!" },
    { wallUserId: u2.id, authorId: u1.id, content: "sk8 or die bro!!" },
    { wallUserId: u4.id, authorId: u3.id, content: "rave on!!" },
  ];

  for (const s of sData) {
    const existing = await db.query.scrapbookPosts.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.wallUserId, s.wallUserId), eq(table.authorId, s.authorId), eq(table.content, s.content)),
    });
    if (!existing) {
      await db.insert(scrapbookPosts).values(s);
    }
  }

  // Messages
  const mData = [
    { senderId: u1.id, recipientId: u2.id, content: "heyy!! wanna go 2 the mall later??" },
    { senderId: u2.id, recipientId: u1.id, content: "sure!! ill bring my board!!" },
    { senderId: u4.id, recipientId: u3.id, content: "found a new rave spot!!" },
  ];

  for (const m of mData) {
    const existing = await db.query.privateMessages.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.senderId, m.senderId), eq(table.recipientId, m.recipientId), eq(table.content, m.content)),
    });
    if (!existing) {
      await db.insert(privateMessages).values(m);
    }
  }

  // Notifications
  const nData = [
    { userId: u2.id, type: "friend_request", relatedId: 1, message: "xXGlitterGurlXx sent you a friend request" },
    { userId: u1.id, type: "testimonial", relatedId: 1, message: "Sk8erBoi99 left a testimonial on your profile" },
  ];

  for (const n of nData) {
    const existing = await db.query.notifications.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.userId, n.userId), eq(table.type, n.type), eq(table.message, n.message)),
    });
    if (!existing) {
      await db.insert(notifications).values(n);
    }
  }

  console.log("Seeded users:", createdUsers.map((u) => u.name).join(", "));
  console.log("Done.");
  process.exit(0);
}

seed();
