import { Work } from "@/lib/db/schema";
import { TitleH2 } from "@/components/typography/title-h2";

export function WorkSummary({ work }: { work: Work }) {
    return (
        <>
            <TitleH2>Zusammenfassung</TitleH2>
            <div className="mt-2">
                <p>{work.summary ? work.summary : "Keine Zusammenfassung verfügbar."}</p>
            </div>
        </>
    );
}