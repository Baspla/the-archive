import { sqliteTable, text, integer, primaryKey, unique } from "drizzle-orm/sqlite-core";
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { AdapterAccountType } from "next-auth/adapters";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { sum } from "drizzle-orm";

const dbPath = process.env.DB_URI || path.join(process.cwd(), 'database', 'archive.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbExists = fs.existsSync(dbPath);
const logEnabled = process.env.DB_LOG === 'true';

if (!dbExists) {
  fs.writeFileSync(dbPath, "");
  console.log("Database created, running migrations...");
  const tempSqlite = new Database(dbPath, { readonly: false, fileMustExist: false });
  const tempDb = drizzle({ client: tempSqlite, logger: logEnabled ? true : false });
  migrate(tempDb, { migrationsFolder: './drizzle' });
  tempSqlite.close();
  console.log("Migrations completed");
}

const sqlite = new Database(dbPath, { readonly: false, fileMustExist: false });
export const db = drizzle({ client: sqlite, logger: logEnabled ? true : false });

if (process.env.DB_MIGRATE !== 'false') {
  try {
    migrate(db, { migrationsFolder: './drizzle' });
  } catch (err) {
    console.error('Migration error (continuing):', (err as Error).message);
  }
}

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp" }),
  image: text("image"),
  creationDate: integer("creation_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  role: text("role").notNull().$defaultFn(() => "user"),
})

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
)

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
})

export const penNames = sqliteTable("pen_names", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  revealDate: integer("reveal_date", { mode: "timestamp" }), // null means unrevealed
  creationDate: integer("creation_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (penName) => [
  unique("user_pen_name").on(penName.name)
]);

export const works = sqliteTable("works", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  penNameId: text("penNameId")
    .notNull()
    .references(() => penNames.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  revealDate: integer("reveal_date", { mode: "timestamp" }), // null means unrevealed
  publicationDate: integer("publication_date", { mode: "timestamp" }), // null means unpublished
  lastEditedDate: integer("last_edited_date", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
  creationDate: integer("creation_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const collections = sqliteTable("collections", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  publicSubmissionsAllowed: integer("public_submissions_allowed", { mode: "boolean" })
    .notNull()
    .$defaultFn(() => false),
  deadlineDate: integer("deadline_date", { mode: "timestamp" }),
  creationDate: integer("creation_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const collectionWorks = sqliteTable("collection_works", {
  collectionId: text("collectionId")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  workId: text("workId")
    .notNull()
    .references(() => works.id, { onDelete: "cascade" }),
  addedByPenNameId: text("addedByPenNameId")
    .notNull()
    .references(() => penNames.id, { onDelete: "cascade" }),
  addedDate: integer("added_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (cw) => [
  primaryKey({ columns: [cw.collectionId, cw.workId] }),
]);

export const user_work_likes = sqliteTable("user_work_likes", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  workId: text("workId")
    .notNull()
    .references(() => works.id, { onDelete: "cascade" }),
});

export const user_work_comments = sqliteTable("user_work_comments", {
  id: text("id")
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  workId: text("workId")
    .notNull()
    .references(() => works.id, { onDelete: "cascade" }),
  content: text("content")
    .notNull(),
  creationDate: integer("creation_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const featuredWorks = sqliteTable("featured_works", {
  id: text("id")
    .primaryKey(),
  workId: text("workId")
    .notNull()
    .references(() => works.id, { onDelete: "cascade" }),
  featureStartDate: integer("feature_start_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  featureEndDate: integer("feature_end_date", { mode: "timestamp" }),
  creationDate: integer("creation_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const featuredCollections = sqliteTable("featured_collections", {
  id: text("id")
    .primaryKey(),
  collectionId: text("collectionId")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  featureStartDate: integer("feature_start_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  featureEndDate: integer("feature_end_date", { mode: "timestamp" }),
  creationDate: integer("creation_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});


export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;

export type PenName = typeof penNames.$inferSelect;
export type NewPenName = typeof penNames.$inferInsert;

export type Work = typeof works.$inferSelect;
export type NewWork = typeof works.$inferInsert;

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

export type CollectionWork = typeof collectionWorks.$inferSelect;
export type NewCollectionWork = typeof collectionWorks.$inferInsert;

export type UserWorkLike = typeof user_work_likes.$inferSelect;
export type NewUserWorkLike = typeof user_work_likes.$inferInsert;

export type UserWorkComment = typeof user_work_comments.$inferSelect;
export type NewUserWorkComment = typeof user_work_comments.$inferInsert;

export type FeaturedWork = typeof featuredWorks.$inferSelect;
export type NewFeaturedWork = typeof featuredWorks.$inferInsert;

export type FeaturedCollection = typeof featuredCollections.$inferSelect;
export type NewFeaturedCollection = typeof featuredCollections.$inferInsert;
