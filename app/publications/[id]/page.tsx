
import { db, publications,authors } from "@/lib/db/schema";
import { eq } from "drizzle-orm/sql";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const publication = await db
    .select({
      id: publications.id,
      title: publications.title,
      content: publications.content,
      authorId: publications.authorId,
      visibility: publications.visibility,
      publishedAt: publications.publishedAt,
      authorPseudonym: authors.pseudonym,
    })
    .from(publications)
    .leftJoin(authors, eq(publications.authorId, authors.id))
    .where(eq(publications.id, id))
    .limit(1)
    .get();

  if (!publication) {
    return (<div>Publication not found</div>);
  }
  return (
    <main>
      <h1>Publication Detail</h1>
      <h2>{publication.title}</h2>
      <p>{publication.content}</p>
      <p><Link href={`/authors/${publication.authorId}`}>Author: {publication.authorPseudonym ?? publication.authorId}</Link></p>
      <p>Visibility: {publication.visibility}</p>
      <p>Published at: {publication.publishedAt.toString()}</p>
    </main>
  );
}
