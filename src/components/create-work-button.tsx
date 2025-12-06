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

export default function CreateWorkButton() {
    const router = useRouter();
    const trpc = useTRPC();
    const createWorkMutation = useMutation(trpc.works.createWork.mutationOptions());
    const [selectedPenNameId, setSelectedPenNameId] = useState<string | undefined>(undefined);

    const handleClick = () => {
        if (!selectedPenNameId) {
            console.error("Bitte ein Pseudonym auswählen");
            return;
        }

        const titleInput = (document.getElementById("newWorkTitle") as HTMLInputElement | null)?.value;

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
                <Button variant="secondary">
                    Neues Werk
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