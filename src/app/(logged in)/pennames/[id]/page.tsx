import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { FileQuestionMark, TorusIcon, UserRoundPen, UserSearch } from "lucide-react";
import { HeroBlock } from "@/components/hero-block";
import { WorkShelf } from "@/components/works/work-shelf";
import { ContentArea } from "@/components/content-area";
import DeletePenNameButton from "@/components/delete-penname-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PenNamePage({ params }: PageProps) {
  const session = await auth();
  const { id: id } = await params;
  if (!session) {
    redirect(`/login?callbackUrl=/pennames/${id}`);
  }
  try {
    const penname = await caller.pennames.getPenNameById({ id });
    return (
      <>
        <HeroBlock>
          <h2 className="text-xl font-bold text-center">Wir stellen vor
            <br></br><span className="pirata-one-regular text-6xl leading-normal ">{penname.name}</span></h2>
          {penname.userId === session.user?.id && (
            <div className="mt-4">
              <DeletePenNameButton penNameId={penname.id} />
            </div>
          )}
        </HeroBlock>
        <ContentArea>
          <WorkShelf works={await caller.works.getWorksByPenNameId({ penNameId: penname.id })} title="Werke unter diesem Pseudonym" />
        </ContentArea>
      </>
    )
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