"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function UserInfo({ id }: { id: string }) {
    const trpc = useTRPC();
    const userQuery = useSuspenseQuery(trpc.users.getUserById.queryOptions({ id }));

    return (
        <div>
            <h2>User Info</h2>
            <p>ID: {userQuery.data.id}</p>
            <p>Name: {userQuery.data.name}</p>
            <p>Email: {userQuery.data.email}</p>
        </div>
    );
}