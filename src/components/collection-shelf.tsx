import { TitleH2 } from "./title-h2";

export function CollectionShelf({ collections }: { collections: any[] }) {
    if (collections.length > 0) {
        return (
            <>
                <TitleH2>Sammlungen</TitleH2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {collections.map((collection) => (
                        <div key={collection.id} className="rounded-lg p-4 bg-muted/50">
                            <h3 className="text-lg font-semibold tracking-wide"><a href={`/collections/${collection.id}`}>{collection.name}</a></h3>
                        </div>
                ))}
            </div>
            </>
        );
    }
    return (
        <div>
            <TitleH2>Sammlungen</TitleH2>
            <p className="px-1 text-muted-foreground">Keine Sammlungen gefunden.</p>
        </div>
    );
}