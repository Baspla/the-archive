import { auth } from "@/auth";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { UserInfo } from "@/components/user-info";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { UserSearch } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from 'react-error-boundary';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: PageProps) {
  const session = await auth();
  const { id: id } = await params;
  if (!session) {
    redirect(`/login?callbackUrl=/users/${id}`);
    return null;
  }
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.users.getUserById.queryOptions({ id })
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <UserSearch />
            </EmptyMedia>
            <EmptyTitle>Benutzer nicht gefunden</EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>Das angeforderte Benutzerkonto existiert nicht.</EmptyDescription>
        </Empty>
      }>
        <Suspense fallback={<div>Loading...</div>}>
          <UserInfo id={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  )
}