import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, BookIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function ContestCard({ contest }: { contest: any }) {
    const formatDate = (date: Date | null) => {
        if (!date) return "🤷";
        return format(date, "dd.MM.yyyy", { locale: de });
    };

    const now = new Date();
    const isEnded = contest.submissionEndDate && now > contest.submissionEndDate;
    const isUpcoming = contest.submissionStartDate && now < contest.submissionStartDate;
    const isActive = contest.submissionStartDate && contest.submissionEndDate &&
        now >= contest.submissionStartDate && now <= contest.submissionEndDate;

    return (
        <Link href={`/contests/${contest.id}`}>
            <Card className="h-full hover:bg-accent/50 transition-colors">
                <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="line-clamp-1">{contest.title}</CardTitle>
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
                            {isEnded && <Badge variant="secondary">Beendet</Badge>}
                            {isUpcoming && <Badge variant="secondary">soon™️</Badge>}
                            {isActive && <Badge variant="secondary">Aktiv</Badge>}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {contest.creator ? (
                            <>
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={contest.creator.image || ""} />
                                    <AvatarFallback>{contest.creator.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <span>{contest.creator.name}</span>
                            </>
                        ) : (
                            <>
                                <UserIcon className="h-4 w-4" />
                                <span>Unbekannt</span>
                            </>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
