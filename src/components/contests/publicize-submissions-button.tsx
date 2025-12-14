"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";

export function PublicizeSubmissionsButton({ contest, className }: { contest: any; className?: string }) {
    const router = useRouter();
    const trpc = useTRPC();
    const publicizeMutation = useMutation(trpc.contests.publicizeSubmissions.mutationOptions());

    const handleClick = () => {
        toast.promise(publicizeMutation.mutateAsync({ id: contest.id }), {
            loading: "Veröffentliche Einreichungen...",
            success: (data) => {
                router.refresh();
                return `${data.count} Einreichungen veröffentlicht!`;
            },
            error: (err) => {
                return `Fehler: ${err.message}`;
            }
        });
    };

    return (
        <Button 
            variant="outline" 
            className={className} 
            onClick={handleClick}
            disabled={publicizeMutation.isPending}
        >
            <Megaphone className="mr-2 h-4 w-4" />
            Alle Einreichungen veröffentlichen
        </Button>
    );
}
