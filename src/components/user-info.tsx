
import { caller } from "@/trpc/server";
import { UserSearch } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "./ui/empty";
import { TODO } from "./todo";

export async function UserInfo({ id }: { id: string }) {

    try {
        const user = await caller.users.getUserById({ id });
        return (
            <div>
                <h2>User Info</h2>
                <p>Name: {user.name}</p>
                <TODO>Pseudonyme anzeigen</TODO>
            </div>
        );
    } catch (error) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia>
                        <UserSearch />
                    </EmptyMedia>
                    <EmptyTitle>Benutzer nicht gefunden</EmptyTitle>
                </EmptyHeader>
                <EmptyDescription>Der angeforderte Benutzer existiert nicht.</EmptyDescription>
            </Empty>
        );
    }
}