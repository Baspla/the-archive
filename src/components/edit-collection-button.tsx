"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircleIcon, Edit } from "lucide-react";
import { Code } from "./code";
import { Switch } from "@/components/ui/switch";

interface EditCollectionButtonProps {
    collection: {
        id: string;
        title: string;
        description: string;
        publicSubmissionsAllowed: boolean;
        ownerHiddenDate: Date | null;
    };
    className?: string;
}

export default function EditCollectionButton({ collection, className }: EditCollectionButtonProps) {
    const router = useRouter();
    const trpc = useTRPC();
    const updateCollectionMutation = useMutation(trpc.collections.updateCollection.mutationOptions());
    
    const [title, setTitle] = useState(collection.title);
    const [description, setDescription] = useState(collection.description);
    const [publicSubmissionsAllowed, setPublicSubmissionsAllowed] = useState(collection.publicSubmissionsAllowed);
    const [isOwnerHidden, setIsOwnerHidden] = useState(!!collection.ownerHiddenDate);
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        if (!title) {
            toast.error("Bitte geben Sie einen Titel ein.");
            return;
        }

        updateCollectionMutation.mutate({ 
            id: collection.id,
            title, 
            description,
            publicSubmissionsAllowed,
            isOwnerHidden
        }, {
            onSuccess: () => {
                router.refresh();
                setIsOpen(false);
                toast.success("Sammlung erfolgreich aktualisiert.");
            }
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className={className}>
                    <Edit className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Sammlung bearbeiten</SheetTitle>
                    <SheetDescription>
                        Bearbeiten Sie die Details Ihrer Sammlung.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
                    <div className="grid gap-3">
                        <Label htmlFor="editCollectionTitle">Titel</Label>
                        <Input 
                            id="editCollectionTitle" 
                            placeholder="Titel der Sammlung" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="editCollectionDescription">Beschreibung</Label>
                        <Input 
                            id="editCollectionDescription" 
                            placeholder="Beschreibung (optional)" 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch 
                            id="public-submissions" 
                            checked={publicSubmissionsAllowed}
                            onCheckedChange={setPublicSubmissionsAllowed}
                        />
                        <Label htmlFor="public-submissions">Öffentliche Einreichungen erlauben</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch 
                            id="hide-owner" 
                            checked={isOwnerHidden}
                            onCheckedChange={setIsOwnerHidden}
                        />
                        <Label htmlFor="hide-owner">Besitzer verbergen</Label>
                    </div>
                    <div className="grid gap-3">
                        <div className="text-sm text-muted-foreground">
                            {updateCollectionMutation.isError && (
                                <Alert variant="destructive">
                                    <AlertCircleIcon className="h-4 w-4" />
                                    <AlertTitle>Fehler beim Aktualisieren</AlertTitle>
                                    <AlertDescription>
                                        <Code>{updateCollectionMutation.error.message}</Code>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                </div>
                <SheetFooter>
                    <Button onClick={handleClick} disabled={updateCollectionMutation.isPending}>
                        {updateCollectionMutation.isPending ? "Speichere..." : "Speichern"}
                    </Button>
                    <SheetClose asChild>
                        <Button variant="outline">Abbrechen</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
