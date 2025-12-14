import { CollectionCard } from "@/components/collections/collection-card";
import { TitleH2 } from "@/components/typography/title-h2";

export function CollectionShelf({ collections, title="Sammlungen"}: { collections: any[], title?: string }) {
    if (collections.length > 0) {
        return (
            <>
                <TitleH2>{title}</TitleH2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {collections.map((collection) => (
                        <CollectionCard key={collection.id} collection={collection} />
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