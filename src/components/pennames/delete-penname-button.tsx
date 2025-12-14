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

interface DeletePenNameButtonProps {
    penNameId: string;
    className?: string;
}

export default function DeletePenNameButton({ penNameId, className }: DeletePenNameButtonProps) {
    const router = useRouter();
    const trpc = useTRPC();
    const deletePenNameMutation = useMutation(trpc.pennames.deletePenName.mutationOptions());

    const handleDelete = () => {
        deletePenNameMutation.mutate({ id: penNameId }, {
            onSuccess: () => {
                router.push("/pennames"); // Redirect to pennames list
                router.refresh();
                toast.success("Pseudonym gelöscht.");
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
                    variant="destructive" 
                    className={className}
                >
                    Pseudonym löschen
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Pseudonym löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Möchtest du dieses Pseudonym wirklich löschen? Alle zugehörigen Werke werden ebenfalls gelöscht.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Löschen
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
