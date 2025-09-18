import { sqliteTable, text, integer, primaryKey, unique } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { createId } from "@paralleldrive/cuid2";
import type { AdapterAccountType } from "next-auth/adapters";

const client = createClient({ url: "file:./dev.db" });
export const db = drizzle(client);

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp" }),
  image: text("image"),
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

export const authors = sqliteTable(
  "authors",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pseudonym: text("pseudonym").notNull(),
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (authors) => [
    // Unique-Constraint für Pseudonym
    unique("authors_pseudonym_unique").on(authors.pseudonym)
  ]
);

export const publicationVisibilityValues = ["public", "private", "unlisted"] as const;
export type PublicationVisibility = typeof publicationVisibilityValues[number];
export const publications = sqliteTable("publications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => authors.id, { onDelete: "restrict" }),
  visibility: text("visibility", { enum: publicationVisibilityValues }).notNull().default("private"),
  publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const collectionVisibilityValues = ["public", "private", "unlisted"] as const;
export type CollectionVisibility = typeof collectionVisibilityValues[number];
export const collections = sqliteTable("collections", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  visibility: text("visibility", { enum: collectionVisibilityValues }).notNull().default("private"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const collectionsPublications = sqliteTable("collections_publications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  collectionId: text("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  publicationId: text("publication_id")
    .notNull()
    .references(() => publications.id, { onDelete: "cascade" }),
  addedAt: integer("added_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const collectionsLogActionValues = ["added", "removed"] as const;
export type CollectionsLogAction = typeof collectionsLogActionValues[number];
export const collectionsLogs = sqliteTable("collections_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  collectionId: text("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  publicationId: text("publication_id")
    .notNull()
    .references(() => publications.id, { onDelete: "cascade" }),
  action: text("action", { enum: collectionsLogActionValues }).notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Author = typeof authors.$inferSelect;
export type Publication = typeof publications.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type CollectionsPublications = typeof collectionsPublications.$inferSelect;
export type CollectionsLog = typeof collectionsLogs.$inferSelect;