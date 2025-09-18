import { db, publications } from "@/lib/db/schema";
import Link from "next/link";

export default async function Page() {
  const publicationsList = await db.select().from(publications).all();
  return (
    <main>
      <h1>Publications Overview</h1>
      <div>
        {publicationsList?.map((publication) => (
          <div key={publication.id}>
            <Link href={`/publications/${publication.id}`}><h2>{publication.title}</h2></Link>
            <p>{publication.summary}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
