import { DarkModeToggle } from "./dark-mode-toggle";
import { Navbar } from "./navbar";
import Link from "next/link";
import { UserMenuBubble } from "./user-menu-bubble";

export function Header() {
    return (
        <header className="flex flex-row p-4 gap-6">
            <Link href="/home" className="text-2xl font-bold">
                The Archive
            </Link>
            <Navbar />
            <div className="flex-1" />
            <div className="flex flex-row gap-4 items-center">
                <DarkModeToggle />
                <UserMenuBubble />
            </div>
        </header>
    );
}
