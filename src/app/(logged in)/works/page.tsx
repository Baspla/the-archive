import { auth } from "@/auth";
import H1 from "@/components/typography/h1";
import { Item } from "@/components/ui/item";
import { WorksDisplay } from "@/components/works-display";
import { redirect } from "next/navigation";

export default async function WorksPage() {
    const session = await auth();
    if (!session) {
        redirect(`/login?callbackUrl=/works`);
        return null;
    }

    return (
        <>
            <H1>
                Werke
            </H1>
            <WorksDisplay />
        </>
    );
}