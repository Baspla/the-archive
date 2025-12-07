import { auth } from "@/auth";
import { ContentArea } from "@/components/content-area";
import { TODO } from "@/components/todo";
import H1 from "@/components/typography/h1";
import { redirect } from "next/navigation";

export default async function ContestsPage() {
    const session = await auth();
    if (!session) {
        redirect(`/login?callbackUrl=/contests`);
        return null;
    }

    return (
        <>
            <ContentArea>
                <H1>
                    Wettbewerbe
                </H1>
                <TODO />
            </ContentArea>
        </>
    );
}