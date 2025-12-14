import { auth } from "@/auth";
import { ContentArea } from "@/components/layout/content-area";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import H1 from "@/components/typography/h1";
import { Subtitle } from "@/components/typography/subtitle";
import SubmitWorkToContestButton from "@/components/contests/submit-work-to-contest-button";
import RemoveWorkFromContestButton from "@/components/contests/remove-work-from-contest-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { WorkCover } from "@/components/works/work-cover";
import { getWorkTitle } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditContestButton from "@/components/contests/edit-contest-button";
import { PublicizeSubmissionsButton } from "@/components/contests/publicize-submissions-button";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ContestPage({ params }: PageProps) {
    const session = await auth();
    const { id } = await params;
    if (!session) {
        redirect(`/login?callbackUrl=/contests/${id}`);
        return null;
    }

    const contest = await caller.contests.getContestById({ id });
    const isCreator = contest.creatorUserId === session.user?.id;

    const now = new Date();
    const isSubmissionOpen = contest.submissionStartDate &&
        now >= contest.submissionStartDate && (!contest.submissionEndDate || now <= contest.submissionEndDate);
    const isSubmissionOver = contest.submissionEndDate && now > contest.submissionEndDate;
    const isPromptRevealed = contest.promptRevealDate && now >= contest.promptRevealDate;

    const formatDate = (date: Date | null) => {
        if (!date) return "TBA";
        return format(date, "dd.MM.yyyy HH:mm", { locale: de });
    };

    return (
        <ContentArea>
            <div className="flex flex-col gap-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <H1>{contest.title}</H1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span>von</span>
                                {contest.creator ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={contest.creator.image || ""} />
                                            <AvatarFallback>{contest.creator.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span>{contest.creator.name}</span>
                                    </div>
                                ) : (
                                    <span>Unbekannt</span>
                                )}
                            </div>
                        </div>
                        {isCreator && (
                            <div className="flex gap-2">
                                {isSubmissionOver && (
                                    <PublicizeSubmissionsButton contest={contest} />
                                )}
                                <EditContestButton contest={contest} />
                            </div>
                        )}
                    </div>

                    <p className="whitespace-pre-wrap text-muted-foreground">{contest.description}</p>

                    {/* Dates Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Prompt Enthüllung</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span className="font-semibold">{formatDate(contest.promptRevealDate)}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Einreichungsstart</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span className="font-semibold">{formatDate(contest.submissionStartDate)}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Einreichungsschluss</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span className="font-semibold">{formatDate(contest.submissionEndDate)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rules & Prompt Section */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Regeln</CardTitle>
                            </CardHeader>
                            <CardContent className="whitespace-pre-wrap">
                                {contest.rules}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Prompt</CardTitle>
                            </CardHeader>
                            <CardContent className="whitespace-pre-wrap">
                                {isPromptRevealed ? (
                                    contest.prompt || "Kein Prompt angegeben."
                                ) : (
                                    <div className="italic text-muted-foreground">
                                        Der Prompt wird am {formatDate(contest.promptRevealDate)} enthüllt.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Submissions Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Werke</h2>
                        <Badge variant="secondary">{contest.submissions.length} Werke</Badge>
                    </div>

                    <div className="flex gap-2">
                        {isSubmissionOpen && (
                            <SubmitWorkToContestButton
                                contestId={contest.id}
                                existingWorkIds={contest.submissions.map(s => s.work.id)}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {contest.submissions.map(({ work, addedBy }) => (
                            <WorkCover
                                key={work.id}
                                id={work.id}
                                title={getWorkTitle(work)}
                                authorName={addedBy.name}
                                teaserDate={work.teaserDate}
                                publicationDate={work.publicationDate}
                                actions={
                                    (isCreator || addedBy.userId === session.user?.id) ? (
                                        <RemoveWorkFromContestButton
                                            contestId={contest.id}
                                            workId={work.id}
                                            className="bg-background/80 hover:bg-background shadow-sm rounded-full h-8 w-8"
                                        />
                                    ) : undefined
                                }
                            />
                        ))}
                        {contest.submissions.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                                Noch keine Einreichungen. Sei der Erste!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ContentArea>
    );
}
