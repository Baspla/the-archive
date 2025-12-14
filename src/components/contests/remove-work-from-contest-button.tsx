"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RemoveWorkFromContestButtonProps {
    contestId: string;
    workId: string;
    className?: string;
}

export default function RemoveWorkFromContestButton({ contestId, workId, className }: RemoveWorkFromContestButtonProps) {
    const router = useRouter();
    const trpc = useTRPC();
    const removeWorkMutation = useMutation(trpc.contests.removeWorkFromContest.mutationOptions());

    const handleRemove = () => {
        removeWorkMutation.mutate({ contestId, workId }, {
            onSuccess: () => {
                router.refresh();
                toast.success("Einreichung zurückgezogen.");
            },
            onError: (error) => {
                toast.error(`Fehler: ${error.message}`);
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`text-destructive hover:text-destructive hover:bg-destructive/10 ${className}`}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Einreichung zurückziehen?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Möchten Sie dieses Werk wirklich aus dem Wettbewerb zurückziehen?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Zurückziehen
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
