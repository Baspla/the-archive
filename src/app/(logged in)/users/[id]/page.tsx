import { auth } from "@/auth";
import { UserInfo } from "@/components/user-info";
import { redirect } from "next/navigation";

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

  return <UserInfo id={id} />;

}