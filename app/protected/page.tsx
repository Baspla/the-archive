import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Protected() {
  const session = await auth();
  return <div>Protected – angemeldet als {session?.user?.name} ({session?.user?.id})</div>;
}
