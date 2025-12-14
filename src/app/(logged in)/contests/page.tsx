import { auth } from "@/auth";
import { ContentArea } from "@/components/layout/content-area";
import { ContestShelf } from "@/components/contests/contest-shelf";
import { TODO } from "@/components/misc/todo";
import H1 from "@/components/typography/h1";
import { redirect } from "next/navigation";
import {caller} from "@/trpc/server";
import { CreateContestButton } from "@/components/contests/create-contest-button";

export default async function ContestsPage() {
    const session = await auth();
    if (!session) {
        redirect(`/login?callbackUrl=/contests`);
        return null;
    }

    const contests = await caller.contests.getAllContests();

    return (
        <>
            <ContentArea>
                <H1>
                    Wettbewerbe
                </H1>
                <p className="mb-4">
                    Wettbewerbe sind Sammlungen, zu denen du Werke einreichen kannst, um an einem Wettbewerb teilzunehmen.
                </p>
                <CreateContestButton />
                <ContestShelf contests={contests}></ContestShelf>
            </ContentArea>
        </>
    );
}