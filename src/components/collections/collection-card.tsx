import Link from "next/link";
import { Collection } from "@/lib/db/schema";
import { Globe, Lock, BookOpen, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CollectionWithDetails = Collection & {
    user: { name: string | null, image: string | null, id: string } | null;
    workCount: number;
};

export function CollectionCard({ collection }: { collection: CollectionWithDetails }) {
    return (
        <Card className="h-full hover:bg-accent/50 transition-colors relative">
            <Link href={`/collections/${collection.id}`} className="absolute inset-0">
                <span className="sr-only">{collection.title}</span>
            </Link>
            <CardHeader>
                    <CardTitle className="line-clamp-2 leading-tight py-0.5">{collection.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                        {collection.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{collection.workCount} {collection.workCount === 1 ? "Werk" : "Werke"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {collection.publicSubmissionsAllowed ? (
                                <div className="flex gap-2 items-center font-normal">
                                    <Globe className="h-4 w-4" /> Öffentliche Einreichungen
                                </div>
                            ) : (
                                <div className="flex gap-2 items-center font-normal">
                                    <Lock className="h-4 w-4" /> Private Sammlung
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="relative z-10">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {collection.user ? (
                            <Link href={`/users/${collection.user?.id}`} className="flex items-center gap-2 hover:underline hover:text-foreground transition-colors">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={collection.user?.image || undefined} />
                                    <AvatarFallback className="text-[10px]">{collection.user?.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                {collection.user?.name}
                            </Link>
                        ) : (
                            <>
                                <UserIcon className="h-4 w-4" />
                                <span>Unbekannt</span>
                            </>
                        )}
                    </div>
                </CardFooter>
            </Card>
    );
}