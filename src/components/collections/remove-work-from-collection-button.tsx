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

interface RemoveWorkButtonProps {
    collectionId: string;
    workId: string;
    className?: string;
}

export default function RemoveWorkFromCollectionButton({ collectionId, workId, className }: RemoveWorkButtonProps) {
    const router = useRouter();
    const trpc = useTRPC();
    const removeWorkMutation = useMutation(trpc.collections.removeWorkFromCollection.mutationOptions());

    const handleRemove = () => {
        toast.promise(removeWorkMutation.mutateAsync({ collectionId, workId }), {
            loading: "Werk wird entfernt...",
            success: () => {
                router.refresh();
                return "Werk aus der Sammlung entfernt.";
            },
            error: (error) => `Fehler: ${error.message}`
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
                    <AlertDialogTitle>Werk entfernen?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Möchtest du dieses Werk wirklich aus der Sammlung entfernen?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Entfernen
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
