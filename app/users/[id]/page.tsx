import { db, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const userId = params.id;
  const user = await db.select().from(users).where(eq(users.id, userId)).get();

  return (
    <main>
      <h1>User Info</h1>
      {user ? (
        <div>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Name:</strong> {user.name ?? "-"}</p>
          {user.image && <img src={user.image} alt="User Avatar" style={{ maxWidth: 120, borderRadius: 8 }} />}
        </div>
      ) : (
        <p>User nicht gefunden.</p>
      )}
    </main>
  );
}
