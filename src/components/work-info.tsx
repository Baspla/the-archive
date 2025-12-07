import { Work } from "@/lib/db/schema";
import { TitleH2 } from "./title-h2";

export function WorkInfo({ work }: { work: Work }) {
    return (
        <>
            <TitleH2>Details</TitleH2>
            <p><strong>Teaser-Datum:</strong> {work.teaserDate ? new Date(work.teaserDate).toLocaleDateString() : "Kein Teaser-Datum gesetzt"}</p>
            <p><strong>Veröffentlichungs-Datum:</strong> {work.publicationDate ? new Date(work.publicationDate).toLocaleDateString() : "Kein Veröffentlichungs-Datum gesetzt"}</p>
        </>
    );
}