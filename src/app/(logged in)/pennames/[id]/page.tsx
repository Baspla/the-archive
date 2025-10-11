import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { FileQuestionMark, TorusIcon, UserRoundPen, UserSearch } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PenNamePage({ params }: PageProps) {
  const session = await auth();
  const { id: id } = await params;
  if (!session) {
    redirect(`/login?callbackUrl=/pennames/${id}`);
    return null;
  }
  try {
    const penname = await caller.pennames.getById(id);
    return <div>PenName {penname.name}</div>
  } catch (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <UserSearch />
          </EmptyMedia>
          <EmptyTitle>Pseudonym nicht gefunden</EmptyTitle>
        </EmptyHeader>
        <EmptyDescription>Das angeforderte Pseudonym existiert nicht.</EmptyDescription>
      </Empty>
    )
  }
}