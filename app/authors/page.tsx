import { db, authors } from "@/lib/db/schema";
import Link from "next/link";

export default async function Page() {
  const authorsList = await db.select().from(authors).all();
  return (
    <main>
      <h1>Authors Overview</h1>
      <div>
        {authorsList?.map((author) => (
          <Link key={author.id} href={`/authors/${author.id}`}>
            {author.pseudonym}
          </Link>
        ))}
      </div>
    </main>
  );
}
