
import { caller } from "@/trpc/server";
import { UserSearch } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "../ui/empty";
import { HeroBlock } from "../layout/hero-block";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ContentArea } from "../layout/content-area";
import { WorkShelf } from "../works/work-shelf";
import { CollectionShelf } from "@/components/collections/collection-shelf";
import { ContestShelf } from "../contests/contest-shelf";
import { PenNameList } from "../pennames/penname-list";

export async function UserInfo({ id }: { id: string }) {

    try {
        const user = await caller.users.getUserById({ id });
        if (!user) {
            throw new Error("User not found");
        }
        const userWorks = await caller.works.getWorksByUserId({ userId: user.id });
        const pennames = await caller.pennames.getPenNamesByUserId({ userId: user.id });
        const collections = await caller.collections.getCollectionsByUserId({ userId: user.id });
        const contests = await caller.contests.getContestsByUserId({ userId: user.id });
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
                    <WorkShelf works={userWorks} title="Werke"></WorkShelf>
                    <PenNameList pennames={pennames} />
                    <CollectionShelf collections={collections} />
                    <ContestShelf contests={contests} />
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