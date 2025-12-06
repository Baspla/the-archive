import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkPage({ params }: PageProps) {
  const session = await auth();
  const { id: id } = await params;
  if (!session) {
    redirect(`/login?callbackUrl=/works/${id}`);
    return null;
  }

  const work = await caller.works.getWorkById({ id });

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">{work.title ? work.title : "Unbenanntes Werk - " + work.id.substring(0, 4)}</h1>
      <p className="text-sm dark:text-zinc-400 text-zinc-600 mb-2">Autor:
        <span> </span>
        <a href={`/pennames/${work.penName.id}`} className="hover:underline">{work.penName.name}</a>
      </p>
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">Details</h2>
        <p><strong>Teaser-Datum:</strong> {work.teaserDate ? new Date(work.teaserDate).toLocaleDateString() : "Kein Teaser-Datum gesetzt"}</p>
        <p><strong>Veröffentlichungsdatum:</strong> {work.publicationDate ? new Date(work.publicationDate).toLocaleDateString() : "Kein Veröffentlichungsdatum gesetzt"}</p>
      </div>
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">Summary</h2>
        <p>{work.summary ? work.summary : "Keine Zusammenfassung verfügbar."}</p>
      </div>
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">Inhalt</h2>
        <p>{work.content ? work.content : "Kein Inhalt verfügbar."}</p>
      </div>
    </div>
  );

}