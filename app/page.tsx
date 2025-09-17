import Link from "next/link";
import { signOut, auth } from "@/auth";

async function UserName() {
  const session = await auth()
  const name = session?.user?.name
  const image = session?.user?.image

  if (!session) {
    return (
      <div>
        <div>Not logged in</div>
        <Link href="/login">Login</Link>
      </div>
    );
  }

  return (
    <div>
      <img src={image ?? undefined} alt="User Avatar" className="inline-block w-8 h-8 mr-2 rounded-full align-middle" />
      Logged in as: {name ?? "Guest"}
      <form action={async function signOutAction() {
        "use server";
        await signOut();
      }}>
      <button type="submit" className="cursor-pointer">Sign out</button>
      </form>
    </div>
  );
}

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita illum tempora sequi assumenda inventore, perferendis magnam ratione ipsum cum consequatur omnis adipisci qui dignissimos, praesentium quod aspernatur quia nostrum nulla.
        </p>
        <Link href="/test">Go to Test Page</Link>
        <Link href="/protected">Go to Protected Page</Link>
        <UserName />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        Based
      </footer>
    </div>
  );
}
