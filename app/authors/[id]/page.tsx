import { authors, db, publications, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm/sql";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

export function AuthorUserLink({ userId, userName, authorIsPublic }: { userId: string; userName: string | null; authorIsPublic: boolean }) {
  if (authorIsPublic) {
    return <Link href={`/users/${userId}`}>User: {userName ?? userId}</Link>;
  }
  return <span>User: Geheim</span>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const author = await db
    .select({
      id: authors.id,
      userName: users.name,
      isPublic: authors.isPublic,
      userId: authors.userId,
    })
    .from(authors)
    .leftJoin(users, eq(authors.userId, users.id))
    .where(eq(authors.id, id))
    .limit(1)
    .get();
    
  const publicationsList = await db
    .select({
      id: publications.id,
      title: publications.title,
      content: publications.content,
      authorId: publications.authorId,
      visibility: publications.visibility,
      publishedAt: publications.publishedAt,
    })
    .from(publications)
    .where(eq(publications.authorId, id))
    .all();

  return (
    <main>
      <h1>Author Detail</h1>
      <AuthorUserLink userId={author?.userId ?? ""} userName={author?.userName ?? ""} authorIsPublic={author?.isPublic ?? false} />
      <h2>Author Publications</h2>
      <div>
        {publicationsList?.map((publication) => (
          <div key={publication.id}>
            <h2><Link href={`/publications/${publication.id}`}>{publication.title}</Link></h2>
          </div>
        ))}
      </div>
    </main>
  );
}
