"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function UserMenuBubble() {
    const { data: session } = useSession()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full" asChild>
                    <Avatar>
                        <AvatarImage src={session?.user?.image ?? undefined} alt={session?.user?.name ?? undefined} />
                        <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <a href={`/users/${session?.user?.id}`}>Profil</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href="/api/auth/signout">
                     Abmelden
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}