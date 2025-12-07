"use client"
// Wenn wir hier nicht "use client" nutzen ist das erste NavigationMenuItem einfach Leer... fml
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import Link from "next/link";

export function Navbar() {
    return (
        <NavigationMenu>
                <NavigationMenuList className="flex flex-row gap-4">
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/works">Werke</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/collections">Sammlungen</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/contests">Wettbewerbe</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/pennames">Pseudonyme</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/users">Benutzer</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
    );
}