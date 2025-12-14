"use client"
// Wenn wir hier nicht "use client" nutzen ist das erste NavigationMenuItem einfach Leer... fml
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navItems = [
    { href: "/works", label: "Werke" },
    { href: "/collections", label: "Sammlungen" },
    //{ href: "/contests", label: "Wettbewerbe" },
    { href: "/pennames", label: "Pseudonyme" },
    { href: "/users", label: "Benutzer" },
];

export function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Desktop Menu */}
            <NavigationMenu className="hidden md:flex">
                <NavigationMenuList className="flex flex-row gap-4">
                    {navItems.map((item) => (
                        <NavigationMenuItem key={item.href}>
                            <NavigationMenuLink asChild>
                                <Link href={item.href} className={navigationMenuTriggerStyle()}>
                                    {item.label}
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>

            {/* Mobile Menu */}
            <div className="md:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="p-4" side="left">
                        <SheetTitle className="mb-4 text-2xl font-bold pirata-one-regular">The Archive</SheetTitle>
                        <div className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm font-medium transition-colors hover:text-primary"
                                    onClick={() => setOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}