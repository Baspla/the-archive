import { Collection } from "@/lib/db/schema";
import { Globe, Lock, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type CollectionWithDetails = Collection & {
    user: { name: string | null, image: string | null, id: string } | null;
    workCount: number;
};

export function CollectionCard({ collection }: { collection: CollectionWithDetails }) {
    return (
        <div className="rounded-lg p-4 bg-muted/50 flex flex-col gap-2 h-full">
            <h3 className="text-lg font-semibold tracking-wide truncate">
                <a href={`/collections/${collection.id}`} className="hover:underline">
                    {collection.title}
                </a>
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto pt-2">
                <div className="flex items-center gap-1" title={collection.publicSubmissionsAllowed ? "Öffentliche Einreichungen erlaubt" : "Private Sammlung"}>
                    {collection.publicSubmissionsAllowed ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                
                <div className="flex items-center gap-1" title={`${collection.workCount} Werke`}>
                    <BookOpen className="w-4 h-4" />
                    <span>{collection.workCount}</span>
                </div>

                {collection.user && (
                    <div className="flex items-center gap-2 ml-auto" title={`Besitzer: ${collection.user.name}`}>
                        <Avatar className="w-6 h-6">
                            <AvatarImage src={collection.user.image || undefined} />
                            <AvatarFallback className="text-[10px]">{collection.user.name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[100px] text-xs">{collection.user.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
}