"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircleIcon, Plus } from "lucide-react";
import { Code } from "./code";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getWorkTitle } from "@/lib/utils";

interface SubmitWorkButtonProps {
    collectionId: string;
    existingWorkIds: string[];
    className?: string;
}

export default function SubmitWorkButton({ collectionId, existingWorkIds, className }: SubmitWorkButtonProps) {
    const router = useRouter();
    const trpc = useTRPC();
    const { data: myWorks, isLoading } = useQuery(trpc.works.getMyWorks.queryOptions());
    const addWorkMutation = useMutation(trpc.collections.addWorkToCollection.mutationOptions());
    
    const [selectedWorkId, setSelectedWorkId] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);

    const availableWorks = myWorks?.filter(w => !existingWorkIds.includes(w.id)) || [];

    const handleClick = () => {
        if (!selectedWorkId) {
            toast.error("Bitte wählen Sie ein Werk aus.");
            return;
        }

        const work = myWorks?.find(w => w.id === selectedWorkId);
        if (!work) return;

        toast.promise(addWorkMutation.mutateAsync({ 
            collectionId,
            workId: selectedWorkId,
            penNameId: work.penNameId
        }), {
            loading: "Werk wird hinzugefügt...",
            success: () => {
                router.refresh();
                setIsOpen(false);
                setSelectedWorkId("");
                return "Werk erfolgreich hinzugefügt.";
            },
            error: (error) => `Fehler: ${error.message}`
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button className={className}>
                    <Plus className="mr-2 h-4 w-4" /> Werk hinzufügen
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Werk hinzufügen</SheetTitle>
                    <SheetDescription>
                        Wählen Sie ein Werk aus, das Sie zu dieser Sammlung hinzufügen möchten.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
                    <div className="grid gap-3">
                        <Label htmlFor="workSelect">Werk auswählen</Label>
                        <Select value={selectedWorkId} onValueChange={setSelectedWorkId}>
                            <SelectTrigger id="workSelect">
                                <SelectValue placeholder="Wählen Sie ein Werk" />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoading ? (
                                    <SelectItem value="loading" disabled>Lade Werke...</SelectItem>
                                ) : availableWorks.length === 0 ? (
                                    <SelectItem value="empty" disabled>Keine verfügbaren Werke</SelectItem>
                                ) : (
                                    availableWorks.map(work => (
                                        <SelectItem key={work.id} value={work.id}>
                                            {getWorkTitle(work)} ({work.penName.name})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-3">
                        <div className="text-sm text-muted-foreground">
                            {addWorkMutation.isError && (
                                <Alert variant="destructive">
                                    <AlertCircleIcon className="h-4 w-4" />
                                    <AlertTitle>Fehler beim Hinzufügen</AlertTitle>
                                    <AlertDescription>
                                        <Code>{addWorkMutation.error.message}</Code>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                </div>
                <SheetFooter>
                    <Button onClick={handleClick} disabled={addWorkMutation.isPending || !selectedWorkId}>
                        {addWorkMutation.isPending ? "Füge hinzu..." : "Hinzufügen"}
                    </Button>
                    <SheetClose asChild>
                        <Button variant="outline">Abbrechen</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
