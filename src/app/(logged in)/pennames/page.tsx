import { auth } from "@/auth";
import { PenNameList } from "@/components/penname-list";
import { ProvisorischCreatePenName } from "@/components/provisorisch/prov-create-pen-name";
import H1 from "@/components/typography/h1";
import { redirect } from "next/navigation";

export default async function PenNamesPage() {
    const session = await auth();
    if (!session) {
        redirect(`/login?callbackUrl=/pennames`);
        return null;
    }

    return (
        <>
            <H1>
                Alle Pseudonyme
            </H1>
                <PenNameList />
            <ProvisorischCreatePenName />
        </>
    );
}