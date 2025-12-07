import { auth } from "@/auth";
import { ContentArea } from "@/components/content-area";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/home");
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <ContentArea>
        <h1 className="text-4xl font-bold">Hallo Welt!</h1>
      </ContentArea>
    </main>
  );
}
