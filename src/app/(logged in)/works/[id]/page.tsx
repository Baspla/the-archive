import { auth } from "@/auth";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkPage({ params }: PageProps) {
    const session = await auth();
    const { id: id } = await params;
    if (!session) {
        redirect(`/login?callbackUrl=/works/${id}`);
        return null;
    }


  return <div>Work {id}</div>
}