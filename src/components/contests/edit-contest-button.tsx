"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Sheet, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon, Edit } from "lucide-react";
import { Code } from "../typography/code";
import { Switch } from "@/components/ui/switch";
import { SheetFormContent } from "@/components/layout/sheet-form";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

interface EditContestButtonProps {
    contest: {
        id: string;
        title: string;
        description: string;
        prompt: string | null;
        rules: string;
        submissionStartDate: Date | null;
        submissionEndDate: Date | null;
        promptRevealDate: Date | null;
        publicationDate: Date | null;
    };
    className?: string;
}

export default function EditContestButton({ contest, className }: EditContestButtonProps) {
    const router = useRouter();
    const trpc = useTRPC();
    const updateContestMutation = useMutation(trpc.contests.updateContest.mutationOptions());

    const formatDateForInput = (date: Date | null) => {
        if (!date) return "";
        return format(date, "yyyy-MM-dd'T'HH:mm");
    };

    const [title, setTitle] = useState(contest.title);
    const [description, setDescription] = useState(contest.description);
    const [prompt, setPrompt] = useState(contest.prompt || "");
    const [rules, setRules] = useState(contest.rules);
    const [isPublic, setIsPublic] = useState(!!contest.publicationDate);
    const [promptRevealDate, setPromptRevealDate] = useState<string>(formatDateForInput(contest.promptRevealDate));
    const [submissionStartDate, setSubmissionStartDate] = useState<string>(formatDateForInput(contest.submissionStartDate));
    const [submissionEndDate, setSubmissionEndDate] = useState<string>(formatDateForInput(contest.submissionEndDate));
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        if (!title) {
            toast.error("Bitte geben Sie einen Titel ein.");
            return;
        }
        if (!description) {
            toast.error("Bitte geben Sie eine Beschreibung ein.");
            return;
        }
        if (!rules) {
            toast.error("Bitte geben Sie Regeln ein.");
            return;
        }

        toast.promise(updateContestMutation.mutateAsync({
            id: contest.id,
            title,
            description,
            prompt,
            rules,
            publicationDate: isPublic ? (contest.publicationDate || new Date()) : undefined,
            promptRevealDate: promptRevealDate ? new Date(promptRevealDate) : undefined,
            submissionStartDate: submissionStartDate ? new Date(submissionStartDate) : undefined,
            submissionEndDate: submissionEndDate ? new Date(submissionEndDate) : undefined,
        }), {
            loading: "Wettbewerb wird aktualisiert...",
            success: () => {
                router.refresh();
                setIsOpen(false);
                return "Wettbewerb erfolgreich aktualisiert.";
            },
            error: (error) => `Fehler bei der Aktualisierung: ${error.message}`
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className={className}>
                    <Edit className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetFormContent
                title="Wettbewerb bearbeiten"
                description="Bearbeiten Sie die Details des Wettbewerbs."
                footer={
                    <>
                        <Button onClick={handleClick} disabled={updateContestMutation.isPending}>
                            {updateContestMutation.isPending ? "Speichere..." : "Speichern"}
                        </Button>
                        <SheetClose asChild>
                            <Button variant="outline">Abbrechen</Button>
                        </SheetClose>
                    </>
                }
            >
                <div className="grid gap-3">
                    <Label htmlFor="editContestTitle">Titel</Label>
                    <Input 
                        id="editContestTitle" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Titel des Wettbewerbs" 
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="editContestDescription">Beschreibung</Label>
                    <Textarea
                        id="editContestDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Beschreibung"
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="editContestRules">Regeln</Label>
                    <Textarea
                        id="editContestRules"
                        value={rules}
                        onChange={(e) => setRules(e.target.value)}
                        placeholder="Regeln"
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="editContestPrompt">Prompt (optional)</Label>
                    <Textarea
                        id="editContestPrompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Prompt"
                    />
                </div>
                {/* 
                <div className="flex items-center space-x-2">
                    <Switch id="editContestPublic" checked={isPublic} onCheckedChange={setIsPublic} />
                    <Label htmlFor="editContestPublic">Öffentlich</Label>
                </div>
                */}
                <div className="grid gap-3">
                    <Label htmlFor="editPromptRevealDate">Prompt Veröffentlichung</Label>
                    <Input
                        id="editPromptRevealDate"
                        type="datetime-local"
                        value={promptRevealDate}
                        onChange={(e) => setPromptRevealDate(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="editSubmissionStartDate">Einreichungsbeginn</Label>
                    <Input
                        id="editSubmissionStartDate"
                        type="datetime-local"
                        value={submissionStartDate}
                        onChange={(e) => setSubmissionStartDate(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="editSubmissionEndDate">Einreichungsende</Label>
                    <Input
                        id="editSubmissionEndDate"
                        type="datetime-local"
                        value={submissionEndDate}
                        onChange={(e) => setSubmissionEndDate(e.target.value)}
                    />
                </div>

                <div className="grid gap-3">
                    <div className="text-sm text-muted-foreground">
                        {updateContestMutation.isError && (
                            <Alert variant="destructive">
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertTitle>Fehler beim Aktualisieren</AlertTitle>
                                <AlertDescription>
                                    <Code>{updateContestMutation.error.message}</Code>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </SheetFormContent>
        </Sheet>
    );
}
