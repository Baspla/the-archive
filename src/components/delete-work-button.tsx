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

interface DeleteWorkButtonProps {
    workId: string;
    className?: string;
}

export default function DeleteWorkButton({ workId, className }: DeleteWorkButtonProps) {
    const router = useRouter();
    const trpc = useTRPC();
    const deleteWorkMutation = useMutation(trpc.works.deleteWork.mutationOptions());

    const handleDelete = () => {
        toast.promise(deleteWorkMutation.mutateAsync({ id: workId }), {
            loading: "Werk wird gelöscht...",
            success: () => {
                router.push("/works"); // Redirect to works list
                router.refresh();
                return "Werk gelöscht.";
            },
            error: (error) => `Fehler: ${error.message}`
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="destructive" 
                    size="icon" 
                    className={className}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Werk löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Möchtest du dieses Werk wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
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
