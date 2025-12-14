import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { WorkEditForm } from "./work-edit-form";
import { HeroBlock } from "@/components/hero-block";
import { ContentArea } from "@/components/content-area";
import { getWorkTitle } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkEditPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/works/${id}/edit`);
    return null;
  }

  const work = await caller.works.getWorkById({ id });

  // Check if user is author
  if (work.penName.userId !== session.user.id) {
    // Redirect to work page if not author
    redirect(`/works/${id}`);
    return null;
  }

  return (
    <>
      <HeroBlock>
        <h1 className="text-4xl font-bold">Werk bearbeiten</h1>
        <p className="text-xl opacity-80">{getWorkTitle(work)}</p>
      </HeroBlock>
      <ContentArea>
        <WorkEditForm work={work} />
      </ContentArea>
    </>
  );
}
