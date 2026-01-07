"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface TogglePenNameRevealButtonProps {
    penNameId: string;
    isRevealed: boolean;
    className?: string;
}

export default function TogglePenNameRevealButton({ penNameId, isRevealed, className }: TogglePenNameRevealButtonProps) {
    const router = useRouter();
    const trpc = useTRPC();
    const updatePenNameMutation = useMutation(trpc.pennames.updatePenName.mutationOptions());

    const handleToggle = () => {
        const newRevealDate = isRevealed ? null : new Date();
        
        toast.promise(
            updatePenNameMutation.mutateAsync({ 
                id: penNameId, 
                revealDate: newRevealDate 
            }),
            {
                loading: 'Aktualisiere Status...',
                success: () => {
                    router.refresh();
                    return isRevealed ? 'Pseudonym verborgen' : 'Pseudonym veröffentlicht';
                },
                error: 'Fehler beim Aktualisieren des Status'
            }
        );
    };

    return (
        <Button
            variant="secondary"
            className={className}
            onClick={handleToggle}
            title={isRevealed ? "Pseudonym verbergen" : "Pseudonym veröffentlichen"}
            disabled={updatePenNameMutation.isPending}
        >
            {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{isRevealed ? "Verbergen" : "Veröffentlichen"}</span>
        </Button>
    );
}
