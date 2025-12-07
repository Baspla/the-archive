import { auth } from "@/auth";
import { ContentArea } from "@/components/content-area";
import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CollectionPage({ params }: PageProps) {
    const session = await auth();
    const { id: id } = await params;
    if (!session) {
        redirect(`/login?callbackUrl=/collections/${id}`);
        return null;
    }

    return (
        <ContentArea>
            <div>Collection {id}</div>
        </ContentArea>
    );
}