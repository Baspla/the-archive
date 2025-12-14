import { CollectionCard } from "@/components/collections/collection-card";
import { TitleH2 } from "@/components/typography/title-h2";

export function CollectionGrid({ collections, title="Sammlungen"}: { collections: any[], title?: string }) {
    if (collections.length > 0) {
        return (
            <>
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
            <p className="px-1 text-muted-foreground">Keine Sammlungen gefunden.</p>
        </div>
    );
}