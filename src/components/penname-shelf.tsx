import { TitleH2 } from "./title-h2";

export function PenNameShelf({ pennames }: { pennames: any[] }) {
    if (pennames.length > 0) {
        return (
            <>
                <TitleH2>Pseudonyme</TitleH2>
                <div className="flex flex-wrap gap-4">
                    {pennames.map((penname) => (
                        <div key={penname.id} className="rounded-lg p-4 bg-muted/50">
                            <h3 className="text-lg font-semibold tracking-wide"><a href={`/pennames/${penname.id}`}>{penname.name}</a></h3>
                        </div>
                    ))}
                </div>
            </>
        );
    }
    return (
        <div>
            <TitleH2>Pseudonyme</TitleH2>
            <p className="px-1 text-muted-foreground">Keine Pseudonyme gefunden.</p>
        </div>
    );
}