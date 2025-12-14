import { auth } from "@/auth";
import { ContentArea } from "@/components/content-area";
import { HeroBlock } from "@/components/hero-block";
import { TimeOfDayWelcome } from "@/components/time-of-day-welcome";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { WorkShelf } from "@/components/works/work-shelf";
import { CollectionShelf } from "@/components/collection-shelf";

export default async function HomePage() {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/home");
    return null;
  }

  const newWorks = await caller.works.getAllWorks({ orderedBy: "publicationDate" });
  const newCollections = await caller.collections.getAllCollections({ orderedBy: "creationDate" });

  return (
    <>
      <HeroBlock>
        <h1 className="text-4xl font-bold"><TimeOfDayWelcome name={session.user?.name} /></h1>
      </HeroBlock>
      <ContentArea>
        <div className="space-y-12">
          <WorkShelf works={newWorks} title="Neue Werke" />
          <CollectionShelf collections={newCollections} title="Neue Sammlungen" />
        </div>
      </ContentArea>
    </>
  );
}
