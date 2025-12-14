import { auth } from "@/auth";
import { ContentArea } from "@/components/content-area";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import H1 from "@/components/typography/h1";
import { Subtitle } from "@/components/typography/subtitle";
import EditCollectionButton from "@/components/edit-collection-button";
import DeleteCollectionButton from "@/components/delete-collection-button";
import SubmitWorkButton from "@/components/submit-work-button";
import RemoveWorkButton from "@/components/remove-work-button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { WorkCover } from "@/components/works/work-cover";
import { EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CollectionPage({ params }: PageProps) {
    const session = await auth();
    const { id } = await params;
    if (!session) {
        redirect(`/login?callbackUrl=/collections/${id}`);
        return null;
    }

    const collection = await caller.collections.getCollectionById({ id });
    const isOwner = collection.userId === session.user?.id;
    const canSubmit = isOwner || collection.publicSubmissionsAllowed;

    return (
        <ContentArea>
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <H1>{collection.title}</H1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>von</span>
                            {collection.user ? (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={collection.user.image || ""} />
                                        <AvatarFallback>{collection.user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span>{collection.user.name}</span>
                                    {collection.ownerHiddenDate && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <EyeOff className="h-4 w-4 text-muted-foreground/70" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Besitzer ist verborgen</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            ) : (
                                <span>Unbekannt</span>
                            )}
                        </div>
                        <Subtitle>{collection.description}</Subtitle>
                        {collection.publicSubmissionsAllowed && (
                            <Badge variant="secondary">Öffentliche Einreichungen erlaubt</Badge>
                        )}
                        {!collection.publicSubmissionsAllowed && (
                            <Badge variant="secondary">Öffentliche Einreichungen nicht erlaubt</Badge>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {canSubmit && (
                            <SubmitWorkButton 
                                collectionId={collection.id} 
                                existingWorkIds={collection.works.map(w => w.work.id)} 
                            />
                        )}
                        {isOwner && (
                            <>
                                <EditCollectionButton collection={collection} />
                                <DeleteCollectionButton collectionId={collection.id} />
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {collection.works.map(({ work, addedBy }) => (
                        <WorkCover
                            key={work.id}
                            id={work.id}
                            title={work.title || "Unbenanntes Werk"}
                            authorName={addedBy.name}
                            teaserDate={work.teaserDate}
                            publicationDate={work.publicationDate}
                            actions={
                                (isOwner || addedBy.userId === session.user?.id) ? (
                                    <RemoveWorkButton 
                                        collectionId={collection.id} 
                                        workId={work.id} 
                                        className="bg-background/80 hover:bg-background shadow-sm rounded-full h-8 w-8"
                                    />
                                ) : undefined
                            }
                        />
                    ))}
                    {collection.works.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            Diese Sammlung enthält noch keine Werke.
                        </div>
                    )}
                </div>
            </div>
        </ContentArea>
    );
}