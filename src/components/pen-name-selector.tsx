"use client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "./ui/input";
import { generateRandomPenName } from "@/lib/nameGenerator";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type PenNameSelectorProps = {
    value?: string;
    onChange?: (value: string) => void;
};

export function PenNameSelector({ value, onChange }: PenNameSelectorProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const penNamesQuery = useQuery(trpc.pennames.getAllPenNames.queryOptions());
    const penNames = (penNamesQuery.data || []) as { id: string; name: string }[];

    const createPenNameMutation = useMutation({
        ...trpc.pennames.createPenName.mutationOptions(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: trpc.pennames.getAllPenNames.queryOptions().queryKey,
            });
        },
    });

    const [createPennameOpen, setCreatePennameOpen] = useState(false);

    function randomizePenName(): void {
        const penNameInput = document.getElementById("newPenName") as HTMLInputElement | null;
        if (penNameInput) {
            penNameInput.value = generateRandomPenName();
        }
    }

    async function handleCreatePenName() {
        const penNameInput = document.getElementById("newPenName") as HTMLInputElement | null;
        if (!penNameInput) {
            console.error("Pen name input not found");
            return;
        }
        try {
            await createPenNameMutation.mutateAsync({ name: penNameInput.value });
            penNameInput.value = "";
            setCreatePennameOpen(false);
        } catch (err) {

        }
    }

    return (
        <>
            <Label htmlFor="penname">Pseudonym</Label>
            <div className="flex gap-4 flex-col items-start">
                <Select value={value} onValueChange={onChange}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Pseudonym auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Deine Pseudonyme</SelectLabel>
                            {penNames.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Sheet open={createPennameOpen} onOpenChange={setCreatePennameOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline">Neues Pseudonym erstellen</Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle>Neues Pseudonym erstellen</SheetTitle>
                            <SheetDescription>
                                Bitte gib ein Pseudonym ein oder generiere ein zufälliges.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="grid flex-1 auto-rows-min gap-6 px-4">
                            <div className="grid gap-3">
                                <Label htmlFor="newPenName">Pseudonym</Label>
                                <div id="penNameBox" className="flex w-full max-w-sm items-center gap-2">
                                    <Input id="newPenName" placeholder="BraveShark" />
                                    <Button variant="outline" onClick={randomizePenName}>
                                        Zufällig
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-3">
                                <div className="text-sm text-muted-foreground">
                                    {createPenNameMutation.isError && (
                                        <p className="text-destructive">Fehler: {(createPenNameMutation.error).message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <SheetFooter>
                            <Button onClick={handleCreatePenName} disabled={createPenNameMutation.isPending}>
                                Erstellen
                            </Button>
                            <SheetClose asChild>
                                <Button variant="outline">Abbrechen</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}