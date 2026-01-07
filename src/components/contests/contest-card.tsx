import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, BookIcon, ClockIcon, CalendarClock, CalendarCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function ContestCard({ contest }: { contest: any }) {
    const formatDate = (date: Date | null) => {
        if (!date) return "Unbekannt";
        return format(date, "dd.MM.yyyy", { locale: de });
    };

    const now = new Date();
    const isEnded = contest.submissionEndDate && now > contest.submissionEndDate;
    const isUpcoming = contest.submissionStartDate && now < contest.submissionStartDate;
    const isActive = contest.submissionStartDate &&
        now >= contest.submissionStartDate && 
        (!contest.submissionEndDate || now <= contest.submissionEndDate);

    return (
        <Card className="h-full hover:bg-accent/50 transition-colors relative">
            <Link href={`/contests/${contest.id}`} className="absolute inset-0">
                <span className="sr-only">{contest.title}</span>
            </Link>
            <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="line-clamp-2 leading-tight py-0.5">{contest.title}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2">
                        {contest.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Start: {formatDate(contest.submissionStartDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Ende: {formatDate(contest.submissionEndDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookIcon className="h-4 w-4" />
                            <span>{contest.submissionCount === 1 ? "1 Teilnahme" : `${contest.submissionCount || 0} Teilnahmen`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEnded && <><CalendarCheck className="h-4 w-4" /> Beendet</>}
                            {isUpcoming && <><CalendarClock className="h-4 w-4" /> Anstehend</>}
                            {isActive && <><ClockIcon className="h-4 w-4" /> Laufend</>}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="relative z-10">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {contest.creator ? (
                            <Link href={`/users/${contest.creator?.id}`} className="flex items-center gap-2 hover:underline hover:text-foreground transition-colors">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={contest.creator?.image || undefined} />
                                    <AvatarFallback className="text-[10px]">{contest.creator?.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                {contest.creator?.name}
                            </Link>
                        ) : (
                            <>
                                <UserIcon className="h-4 w-4" />
                                <span>Unbekannt</span>
                            </>
                        )}
                    </div>
                </CardFooter>
            </Card>
    );
}
