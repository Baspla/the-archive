import { NextRequest, NextResponse } from "next/server";
import { db, publications } from "@/lib/db/schema";
import { eq } from "drizzle-orm/sql";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, content, summary, authorId, visibility } = await req.json();
  if (!title || !content || !summary || !authorId || !visibility) {
    return NextResponse.json({ error: "Alle Felder sind erforderlich." }, { status: 400 });
  }
  try {
    const [publication] = await db
      .insert(publications)
      .values({
        title,
        content,
        summary,
        authorId,
        visibility,
        userId: session.user.id,
        publishedAt: new Date(),
      })
      .returning();
    return NextResponse.json({ publication });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create publication" }, { status: 500 });
  }
}
