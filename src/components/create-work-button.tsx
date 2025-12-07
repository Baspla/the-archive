"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PenNameSelector } from "@/components/pen-name-selector";
import { useState } from "react";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { Code } from "./code";

export default function CreateWorkButton({ children, className }: { children?: React.ReactNode; className?: string }) {
    const router = useRouter();
    const trpc = useTRPC();
    const createWorkMutation = useMutation(trpc.works.createWork.mutationOptions());
    const [selectedPenNameId, setSelectedPenNameId] = useState<string | undefined>(undefined);

    const handleClick = () => {

        const titleInput = (document.getElementById("newWorkTitle") as HTMLInputElement | null)?.value;

        if (!selectedPenNameId) {
            toast.error("Bitte wähle ein Pseudonym aus, unter dem das Werk erstellt werden soll.");
            const penNameSelector = document.getElementById("penNameSelector");
            penNameSelector?.focus();
            return;
        }

        void createWorkMutation.mutate({ pennameid: selectedPenNameId, title: titleInput }, {
            onSuccess: () => {
                router.refresh();
            }
        });

    };

    return (
        <>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="secondary" className={className}>
                        {children || "Neues Werk erstellen"}
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle>Neues Werk erstellen</SheetTitle>
                        <SheetDescription>
                            Bitte geben Sie die Details für das neue Werk ein.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="newWorkTitle">Titel
                                <span className="text-sm text-muted-foreground"> (optional)</span>
                            </Label>
                            <Input id="newWorkTitle" placeholder="Titel" />
                        </div>
                        <div className="grid gap-3">
                            <PenNameSelector value={selectedPenNameId} onChange={setSelectedPenNameId} />
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
                    </div>
                    <SheetFooter>
                        <Button onClick={handleClick}>Erstellen</Button>
                        <SheetClose asChild>
                            <Button variant="outline">Abbrechen</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}