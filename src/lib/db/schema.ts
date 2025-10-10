import { sqliteTable, text, integer, primaryKey, unique } from "drizzle-orm/sqlite-core";
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { AdapterAccountType } from "next-auth/adapters";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const dbPath = process.env.DB_URI || path.join(process.cwd(), 'database', 'crewnow.db');
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
  streakLength: integer("streak_length").notNull().default(0),
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

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;