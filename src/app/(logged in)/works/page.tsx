import { auth } from "@/auth";
import CreateWorkButton from "@/components/create-work-button";
import H1 from "@/components/typography/h1";
import { WorksDisplay } from "@/components/works-display";
import { caller } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function WorksPage() {
    const session = await auth();
    if (!session) {
        redirect(`/login?callbackUrl=/works`);
        return null;
    }
    const userWorks = await caller.works.getWorksByUserId({ userId: session.user!.id! });
    const allWorks = await caller.works.getAllWorks();
    return (
        <>
            <H1>
                Werke
            </H1>
            <div className="flex flex-col gap-8 px-8">
                <WorksDisplay works={userWorks} title="Deine Werke" />
                <WorksDisplay works={allWorks} title="Andere Werke" />
                <CreateWorkButton />
            </div>
        </>
    );
}