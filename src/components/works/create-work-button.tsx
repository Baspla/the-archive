"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Sheet, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PenNameSelector } from "@/components/pennames/pen-name-selector";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Code } from "../typography/code";
import { SheetFormContent } from "@/components/layout/sheet-form";

export default function CreateWorkButton({ children, className, userId }: { children?: React.ReactNode; className?: string; userId: string }) {
    const router = useRouter();
    const trpc = useTRPC();
    const createWorkMutation = useMutation(trpc.works.createWork.mutationOptions());
    const [selectedPenNameId, setSelectedPenNameId] = useState<string | undefined>(undefined);
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {

        const titleInput = (document.getElementById("newWorkTitle") as HTMLInputElement | null)?.value;

        if (!selectedPenNameId) {
            toast.error("Bitte wähle ein Pseudonym aus, unter dem das Werk erstellt werden soll.");
            const penNameSelector = document.getElementById("penNameSelector");
            penNameSelector?.focus();
            return;
        }

        toast.promise(createWorkMutation.mutateAsync({ pennameid: selectedPenNameId, title: titleInput }), {
            loading: "Werk wird erstellt...",
            success: () => {
                router.refresh();
                setIsOpen(false);
                setSelectedPenNameId(undefined);
                return "Werk erfolgreich erstellt.";
            },
            error: (error) => `Fehler beim Erstellen des Werkes: ${error.message}`
        });

    };

    return (
        <>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="secondary" className={className}>
                        {children || "Neues Werk erstellen"}
                    </Button>
                </SheetTrigger>
                <SheetFormContent
                    title="Neues Werk erstellen"
                    description="Bitte geben Sie die Details für das neue Werk ein."
                    footer={
                        <>
                            <Button onClick={handleClick}>Erstellen</Button>
                            <SheetClose asChild>
                                <Button variant="outline">Abbrechen</Button>
                            </SheetClose>
                        </>
                    }
                >
                    <div className="grid gap-3">
                        <Label htmlFor="newWorkTitle">Titel
                            <span className="text-sm text-muted-foreground"> (optional)</span>
                        </Label>
                        <Input id="newWorkTitle" placeholder="Titel" />
                    </div>
                    <div className="grid gap-3">
                        <PenNameSelector value={selectedPenNameId} onChange={setSelectedPenNameId} userId={userId} />
                    </div>
                    <div className="grid gap-3">
                        <div className="text-sm text-muted-foreground">
                            {createWorkMutation.isError && (
                                <Alert variant="destructive">
                                    <AlertCircleIcon />
                                    <AlertTitle>Fehler beim Erstellen des Werks</AlertTitle>
                                    <AlertDescription><Code>{(createWorkMutation.error).message}</Code>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                </SheetFormContent>
            </Sheet>
        </>
    );
}