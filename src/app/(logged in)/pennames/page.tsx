import { auth } from "@/auth";
import { PenNameList } from "@/components/pennames/penname-list";
import H1 from "@/components/typography/h1";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { ContentArea } from "@/components/layout/content-area";

export default async function PenNamesPage() {
    const session = await auth();
    if (!session) {
        redirect(`/login?callbackUrl=/pennames`);
        return null;
    }

    const pennames = await caller.pennames.getAllPenNames();

    return (
        <>
            <ContentArea>
                <H1>
                    Alle Pseudonyme
                </H1>
                <p>
                    Du kannst beim erstellen eines Werkes ein Pseudonym auswählen oder ein neues erstellen.
                </p>
                <PenNameList pennames={pennames} />
            </ContentArea>
        </>
    );
}