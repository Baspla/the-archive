"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Sheet, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getWorkTitle } from "@/lib/utils";
import { SheetFormContent } from "@/components/layout/sheet-form";

interface SubmitWorkToContestButtonProps {
    contestId: string;
    existingWorkIds: string[];
    className?: string;
}

export default function SubmitWorkToContestButton({ contestId, existingWorkIds, className }: SubmitWorkToContestButtonProps) {
    const router = useRouter();
    const trpc = useTRPC();
    const { data: myWorks, isLoading } = useQuery(trpc.works.getMyWorks.queryOptions());
    const addWorkMutation = useMutation(trpc.contests.addWorkToContest.mutationOptions());

    const [selectedWorkId, setSelectedWorkId] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);

    const availableWorks = myWorks?.filter(w => !existingWorkIds.includes(w.id)) || [];

    const handleClick = () => {
        if (!selectedWorkId) {
            toast.error("Bitte wählen Sie ein Werk aus.");
            return;
        }

        addWorkMutation.mutate({
            contestId,
            workId: selectedWorkId
        }, {
            onSuccess: () => {
                router.refresh();
                setIsOpen(false);
                setSelectedWorkId("");
                toast.success("Werk erfolgreich eingereicht!");
            },
            onError: (error) => {
                toast.error(`Fehler: ${error.message}`);
            }
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button className={className}>
                    <Plus className="mr-2 h-4 w-4" />
                    Werk einreichen
                </Button>
            </SheetTrigger>
            <SheetFormContent
                title="Werk einreichen"
                description="Wählen Sie eines Ihrer Werke aus, um es für diesen Wettbewerb einzureichen."
                footer={
                    <>
                        <SheetClose asChild>
                            <Button variant="outline">Abbrechen</Button>
                        </SheetClose>
                        <Button onClick={handleClick} disabled={addWorkMutation.isPending || !selectedWorkId}>
                            {addWorkMutation.isPending ? "Wird eingereicht..." : "Einreichen"}
                        </Button>
                    </>
                }
            >
                <div className="grid gap-3">
                    <Label htmlFor="work">Werk</Label>
                    <Select value={selectedWorkId} onValueChange={setSelectedWorkId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Werk auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoading ? (
                                <SelectItem value="loading" disabled>Laden...</SelectItem>
                            ) : availableWorks.length === 0 ? (
                                <SelectItem value="empty" disabled>Keine verfügbaren Werke</SelectItem>
                            ) : (
                                availableWorks.map((work) => (
                                    <SelectItem key={work.id} value={work.id}>
                                        {getWorkTitle(work)}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </SheetFormContent>
        </Sheet>
    );
}
