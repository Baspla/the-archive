import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { ContentArea } from "@/components/layout/content-area";
import { HeroBlock } from "@/components/layout/hero-block";
import { Subtitle } from "@/components/typography/subtitle";
import { WorkInfo } from "@/components/works/work-info";
import { WorkSummary } from "@/components/works/work-summary";
import { WorkContentLink } from "@/components/works/work-content-link";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CollectionShelf } from "@/components/collections/collection-shelf";
import DeleteWorkButton from "@/components/works/delete-work-button";
import { getWorkTitle } from "@/lib/utils";
import fs from "fs";
import path from "path";
import { GenerateAudioButton } from "@/components/works/generate-audio-button";
import { ContestShelf } from "@/components/contests/contest-shelf";

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
  const collections = await caller.collections.getCollectionsByWorkId({ workId: work.id });
  const contests = await caller.contests.getContestsByWorkId({ workId: work.id });

  const audioPath = path.join(process.cwd(), "uploads", `${work.id}.mp3`);
  const hasAudio = fs.existsSync(audioPath);
  const isAdmin = session.user?.role?.toUpperCase() === "ADMIN";

  return (
    <>
      <HeroBlock>
        <h1 className="text-4xl font-bold">
          {getWorkTitle(work)}
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
            <>
              <Button asChild variant="secondary">
                <Link href={`/works/${work.id}/edit`}>
                  Werk bearbeiten
                </Link>
              </Button>
              <DeleteWorkButton workId={work.id} />
            </>
          )}
        </div>

        {hasAudio && (
          <div className="my-4">
            <audio controls src={`/api/uploads/audio/${work.id}`} className="w-full" />
          </div>
        )}

        {isAdmin && (
          <div className="my-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Admin: Audio Generation</h3>
            <GenerateAudioButton workId={work.id} />
          </div>
        )}
        <WorkInfo work={work} />

        <WorkSummary work={work} />
        <CollectionShelf collections={collections} />
        <ContestShelf contests={contests} />
      </ContentArea>
    </>
  );

}