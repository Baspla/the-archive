import { auth } from "@/auth";
import { ContentArea } from "@/components/layout/content-area";
import { Navbar } from "@/components/layout/navbar";
import H1 from "@/components/typography/h1";
import { UserList } from "@/components/users/user-list";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";


export default async function UsersPage() {
    const session = await auth();
    if (!session) {
        redirect(`/login?callbackUrl=/users`);
        return null;
    }

    return (
        <>
            <ContentArea>
                <H1>
                    Alle Benutzer
                </H1>
                <UserList />
            </ContentArea>
        </>
    );
}