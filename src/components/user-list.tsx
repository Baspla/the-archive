import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import Link from "next/link";
import { caller } from "@/trpc/server";

export async function UserList() {
    const users = await caller.users.getAllUsers()
    return (
        <>
            <div className="my-8 gap-4 flex flex-col">
                {users.map((user) => (
                    <Item key={user.id} variant="muted">
                        <ItemMedia variant="image">
                            <Avatar>
                                <AvatarImage src={user.image ?? undefined} alt={user.name ?? undefined} />
                                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>{user.name}<RoleBadge role={user.role} /></ItemTitle>
                            <ItemDescription>Dabei seit {user.creationDate.toLocaleDateString()}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button variant="default" asChild>
                                <Link href={`/users/${user.id}`}>Details</Link>
                            </Button>
                        </ItemActions>
                    </Item>
                ))}
            </div>
        </>
    );
}