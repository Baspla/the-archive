import { ContestCard } from "./contest-card";
import { TitleH2 } from "../typography/title-h2";

export function ContestShelf({ contests }: { contests: any[] }) {
    if (contests.length > 0) {
        return (
            <>
                <TitleH2>Wettbewerbe</TitleH2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {contests.map((contest) => (
                        <ContestCard key={contest.id} contest={contest} />
                    ))}
                </div>
            </>
        );
    }
    return (
        <div>
            <TitleH2>Wettbewerbe</TitleH2>
            <p className="px-1 text-muted-foreground">Keine Wettbewerbe gefunden.</p>
        </div>
    );
}