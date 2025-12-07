import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { ContentArea } from "@/components/content-area";
import { HeroBlock } from "@/components/hero-block";
import { Subtitle } from "@/components/subtitle";
import { Reader } from "@/components/reader";

interface ReadWorkPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReadWorkPage({ params }: ReadWorkPageProps) {
  const session = await auth();
  const { id: id } = await params;
  if (!session) {
    redirect(`/login?callbackUrl=/works/${id}`);
    return null;
  }

  const work = await caller.works.getWorkById({ id });

  return (
    <>
      <div className="mx-8">
      <Reader work={work} />
      </div>
    </>
  );

}