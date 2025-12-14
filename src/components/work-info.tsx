import { Work } from "@/lib/db/schema";
import { TitleH2 } from "./typography/title-h2";

export function WorkInfo({ work }: { work: Work }) {
    if (!work) {
        return null;
    }
    if (!work.teaserDate && work.publicationDate) {
        return (
            <>
                <TitleH2>Veröffentlichungsinfo</TitleH2>
                <p>Ungütlige Kombination von teaserDate und publicationDate.</p>
            </>
        );
    }
    if (work.teaserDate && !work.publicationDate) {
        return (
            <>
                <TitleH2>Veröffentlichungsinfo</TitleH2>
                <p>Am {new Date(work.teaserDate).toLocaleDateString()} angeteasert.</p>
            </>
        );
    }
    if (work.teaserDate && work.publicationDate) {
        return (
            <>
                <TitleH2>Veröffentlichungsinfo</TitleH2>
                <p>Am {new Date(work.publicationDate).toLocaleDateString()} veröffentlicht.</p>
            </>
        );
    }
    return (
        <>
            <TitleH2>Veröffentlichungsinfo</TitleH2>
            <p>Noch nicht veröffentlicht.</p>
        </>
    );
}