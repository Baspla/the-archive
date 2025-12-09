import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { ContentArea } from "@/components/content-area";
import { HeroBlock } from "@/components/hero-block";
import { Subtitle } from "@/components/subtitle";
import { WorkInfo } from "@/components/work-info";
import { WorkSummary } from "@/components/work-summary";
import { WorkContentLink } from "@/components/work-content-link";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TitleH2 } from "@/components/title-h2";

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

  const work = await caller.works.getWorkById({ id });
  const isAuthor = session.user?.id === work.penName.userId;

  return (
    <>
      <HeroBlock>
        <h1 className="text-4xl font-bold">
          {work.title || "Unbenanntes Werk - " + work.id.substring(0, 4)}
        </h1>
        <Subtitle>verfasst von <a className="font-semibold text-2xl pirata-one-regular" href={`/pennames/${work.penName.id}`}>
          {work.penName.name}
        </a>
        </Subtitle>
      </HeroBlock>
      <ContentArea>
        <div className="flex flex-row gap-2 mt-4">
          <WorkContentLink work={work} />
          {isAuthor && (
            <Button asChild variant="secondary">
              <Link href={`/works/${work.id}/edit`}>
                Werk bearbeiten
              </Link>
            </Button>
          )}
        </div>
        <WorkInfo work={work} />
        <WorkSummary work={work} />
      </ContentArea>
    </>
  );

}