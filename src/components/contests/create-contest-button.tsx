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
import { AlertCircleIcon } from "lucide-react";
import { Code } from "../typography/code";
import { Switch } from "@/components/ui/switch";
import { SheetFormContent } from "@/components/layout/sheet-form";
import { Textarea } from "@/components/ui/textarea";

export function CreateContestButton({ children, className }: { children?: React.ReactNode; className?: string }) {
    const router = useRouter();
    const trpc = useTRPC();
    const createContestMutation = useMutation(trpc.contests.createContest.mutationOptions());

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [prompt, setPrompt] = useState("");
    const [rules, setRules] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [promptRevealDate, setPromptRevealDate] = useState<string>("");
    const [submissionStartDate, setSubmissionStartDate] = useState<string>("");
    const [submissionEndDate, setSubmissionEndDate] = useState<string>("");
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

        toast.promise(createContestMutation.mutateAsync({
            title,
            description,
            prompt,
            rules,
            publicationDate: isPublic ? new Date() : undefined,
            promptRevealDate: promptRevealDate ? new Date(promptRevealDate) : undefined,
            submissionStartDate: submissionStartDate ? new Date(submissionStartDate) : undefined,
            submissionEndDate: submissionEndDate ? new Date(submissionEndDate) : undefined,
        }), {
            loading: "Wettbewerb wird erstellt...",
            success: () => {
                router.refresh();
                //reset fields
                setTitle("");
                setDescription("");
                setPrompt("");
                setRules("");
                setIsPublic(false);
                setPromptRevealDate("");
                setSubmissionStartDate("");
                setSubmissionEndDate("");
                // close sheet
                setIsOpen(false);
                return "Wettbewerb erfolgreich erstellt.";
            },
            error: (error) => `Fehler beim Erstellen des Wettbewerbs: ${error.message}`
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="secondary" className={className}>
                    {children || "Neuen Wettbewerb erstellen"}
                </Button>
            </SheetTrigger>
            <SheetFormContent
                title="Neuen Wettbewerb erstellen"
                description="Bitte geben Sie die Details für den neuen Wettbewerb ein."
                footer={
                    <>
                        <Button onClick={handleClick} disabled={createContestMutation.isPending}>
                            {createContestMutation.isPending ? "Erstelle..." : "Erstellen"}
                        </Button>
                        <SheetClose asChild>
                            <Button variant="outline">Abbrechen</Button>
                        </SheetClose>
                    </>
                }
            >
                <div className="grid gap-3">
                    <Label htmlFor="contestTitle">Titel</Label>
                    <Input id="contestTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titel des Wettbewerbs" />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="contestDescription">Beschreibung</Label>
                    <Textarea
                        id="contestDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Beschreibung"
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="contestRules">Regeln</Label>
                    <Textarea
                        id="contestRules"
                        value={rules}
                        onChange={(e) => setRules(e.target.value)}
                        placeholder="Regeln"
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="contestPrompt">Prompt (optional)</Label>
                    <Textarea
                        id="contestPrompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Prompt"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="contestPublic" checked={isPublic} onCheckedChange={setIsPublic} />
                    <Label htmlFor="contestPublic">Öffentlich (sofort veröffentlichen)</Label>
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="promptRevealDate">Prompt Veröffentlichung</Label>
                    <Input
                        id="promptRevealDate"
                        type="datetime-local"
                        value={promptRevealDate}
                        onChange={(e) => setPromptRevealDate(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="submissionStartDate">Einreichungsbeginn</Label>
                    <Input
                        id="submissionStartDate"
                        type="datetime-local"
                        value={submissionStartDate}
                        onChange={(e) => setSubmissionStartDate(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="submissionEndDate">Einreichungsende</Label>
                    <Input
                        id="submissionEndDate"
                        type="datetime-local"
                        value={submissionEndDate}
                        onChange={(e) => setSubmissionEndDate(e.target.value)}
                    />
                </div>

                <div className="grid gap-3">
                    <div className="text-sm text-muted-foreground">
                        {createContestMutation.isError && (
                            <Alert variant="destructive">
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertTitle>Fehler beim Erstellen des Wettbewerbs</AlertTitle>
                                <AlertDescription><Code>{(createContestMutation.error).message}</Code>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </SheetFormContent>
        </Sheet>
    );
}
