import { RedactablePenNameWithUser } from "@/lib/db/schema";
import { PenNameCard } from "./penname-card";
import { TitleH2 } from "../typography/title-h2";

export interface PenNameListProps {
    pennames: Array<RedactablePenNameWithUser>;
    title?: string;
}

export async function PenNameList({ pennames, title = "Pseudonyme" }: PenNameListProps) {
    if (pennames.length === 0) {
        return (
            <div className="my-8">
                <TitleH2>{title}</TitleH2>
                <p className="px-1 text-muted-foreground">Keine Pseudonyme gefunden.</p>
            </div>
        );
    }

    return (
        <>
            <TitleH2>{title}</TitleH2>
            <div className="my-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pennames.map((penname) => (
                    <PenNameCard key={penname.id} penname={penname} />
                ))}
            </div>
        </>
    );
}