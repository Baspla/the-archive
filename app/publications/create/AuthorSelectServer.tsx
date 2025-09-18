import { auth } from "@/auth";
import { db, authors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function AuthorSelectServer({ children }: { children: (authors: { id: string, pseudonym: string | null }[]) => React.ReactNode }) {
  const session = await auth();
  const authorList = await db.select({ id: authors.id, pseudonym: authors.pseudonym }).from(authors).where(eq(authors.userId, session?.user?.id as string));
  return children(authorList);
}
