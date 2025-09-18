
import { NextRequest, NextResponse } from "next/server";
import { db, authors } from "@/lib/db/schema";
import { eq } from "drizzle-orm/sql";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { pseudonym, isPublic } = await req.json();
  if (!pseudonym) {
    return NextResponse.json({ error: "Pseudonym is required" }, { status: 400 });
  }
  // Prüfe, ob das Pseudonym bereits existiert
  const existing = await db.select().from(authors).where(eq(authors.pseudonym, pseudonym));
  if (existing.length > 0) {
    return NextResponse.json({ error: "Pseudonym ist bereits vergeben." }, { status: 409 });
  }
  try {
    const [author] = await db
      .insert(authors)
      .values({
        userId: session.user.id,
        pseudonym,
        isPublic: !!isPublic,
      })
      .returning();
    return NextResponse.json({ author });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create author" }, { status: 500 });
  }
}
