import { auth } from "@/auth";
import { ContentArea } from "@/components/content-area";
import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ContestPage({ params }: PageProps) {
    const session = await auth();
    const { id: id } = await params;
    if (!session) {
        redirect(`/login?callbackUrl=/contests/${id}`);
        return null;
    }

    return (
        <ContentArea>
            <div>Contest {id}</div>
        </ContentArea>
    );
}