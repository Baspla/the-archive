
import { caller } from "@/trpc/server";
import { UserSearch } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "./ui/empty";
import { TODO } from "./todo";
import { HeroBlock } from "./hero-block";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ContentArea } from "./content-area";
import { BookShelf } from "./book-shelf";
import { TitleH2 } from "./title-h2";
import { PenNameShelf } from "./penname-shelf";
import { CollectionShelf } from "./collection-shelf";
import { ContestShelf } from "./contest-shelf";

export async function UserInfo({ id }: { id: string }) {

    try {
        const user = await caller.users.getUserById({ id });
        if (!user) {
            throw new Error("User not found");
        }
        const userWorks = await caller.works.getWorksByUserId({ userId: user.id });
        const pennames = await caller.pennames.getPenNamesByUserId({ userId: user.id });
        const collections = await caller.collections.getCollectionsByUserId({ userId: user.id });
        //const contests = await caller.contests.getContestsByUserId({ userId: user.id });
        return (
            <>
                <HeroBlock>
                    <div className="flex flex-row items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={user.image ?? undefined} alt={user.name ?? undefined} />
                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <h1 className="text-5xl font-bold">{user.name}</h1>
                    </div>
                </HeroBlock>
                <ContentArea>
                    <BookShelf works={userWorks} title="Werke"></BookShelf>
                    <PenNameShelf pennames={pennames} />
                    <CollectionShelf collections={collections} />
                    <ContestShelf contests={[]} />
                </ContentArea>
            </>
        );
    } catch (error) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia>
                        <UserSearch />
                    </EmptyMedia>
                    <EmptyTitle>Benutzer nicht gefunden</EmptyTitle>
                </EmptyHeader>
                <EmptyDescription>Der angeforderte Benutzer existiert nicht.</EmptyDescription>
            </Empty>
        );
    }
}