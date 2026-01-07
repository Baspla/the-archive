import Link from "next/link";
import { RedactablePenNameWithUser } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, BookOpen, Calendar, EyeIcon, EyeOffIcon, User } from "lucide-react";

interface PenNameCardProps {
    penname: RedactablePenNameWithUser;
}

export function PenNameCard({ penname }: PenNameCardProps) {
    return (
        <Card className="h-full flex flex-col relative hover:bg-accent/50 transition-colors">
            <Link href={`/pennames/${penname.id}`} className="absolute inset-0">
                <span className="sr-only">Details</span>
            </Link>
            <CardHeader>
                <CardTitle className="line-clamp-1 leading-tight py-0.5">{penname.name}</CardTitle>
            </CardHeader>
            <CardContent className="grow">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{penname.workCount} {penname.workCount === 1 ? "Werk" : "Werke"}</span>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                        {penname.user ? (
                            <Link href={`/users/${penname.user?.id}`} className="flex items-center gap-2 hover:underline hover:text-foreground transition-colors">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={penname.user?.image || undefined} />
                                    <AvatarFallback className="text-[10px]">{penname.user?.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                {penname.user?.name}
                                {!penname.revealDate && <EyeOffIcon className="w-4 h-4" />}
                            </Link>
                        ) : (
                            <>
                                <User className="w-4 h-4" />
                                <span>Benutzer unbekannt</span>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
