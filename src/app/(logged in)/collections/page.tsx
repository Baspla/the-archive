import { auth } from "@/auth";
import { ContentArea } from "@/components/content-area";
import { TODO } from "@/components/todo";
import H1 from "@/components/typography/h1";
import { redirect } from "next/navigation";

export default async function CollectionsPage() {
    const session = await auth();
    if (!session) {
        redirect(`/login?callbackUrl=/collections`);
        return null;
    }

    return (
        <>
            <ContentArea>
                <H1>
                    Sammlungen
                </H1>
                <TODO />
            </ContentArea>
        </>
    );
}