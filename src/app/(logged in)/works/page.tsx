import { auth } from "@/auth";
import { WorkShelf } from "@/components/works/work-shelf";
import { ContentArea } from "@/components/layout/content-area";
import CreateWorkButton from "@/components/works/create-work-button";
import H1 from "@/components/typography/h1";
import { WorksDisplay } from "@/components/works/works-display";
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
            <ContentArea>
                <H1>
                    Werke
                </H1>
                <div className="flex flex-col gap-8">
                    <div>
                        <p className="mb-4">Du kannst entweder selbst ein neues Werk erstellen oder dir ein Tee machen und peak Poetry genießen.
                            <br></br>Viel Spaß beim Stöbern und Schreiben!
                        </p>
                        <CreateWorkButton className="self-start" userId={session.user!.id!}>
                            Neues Werk erstellen
                        </CreateWorkButton>
                    </div>
                    <WorkShelf works={userWorks} title="Deine Werke" />
                    <WorkShelf works={allWorks} title="Alle Werke" />

                </div>
            </ContentArea>
        </>
    );
}