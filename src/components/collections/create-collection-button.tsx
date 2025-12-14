"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Sheet, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Code } from "../typography/code";
import { Switch } from "@/components/ui/switch";
import { SheetFormContent } from "@/components/layout/sheet-form";

export default function CreateCollectionButton({ children, className }: { children?: React.ReactNode; className?: string }) {
    const router = useRouter();
    const trpc = useTRPC();
    const createCollectionMutation = useMutation(trpc.collections.createCollection.mutationOptions());
    
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [publicSubmissionsAllowed, setPublicSubmissionsAllowed] = useState(false);
    const [isOwnerHidden, setIsOwnerHidden] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        if (!title) {
            toast.error("Bitte geben Sie einen Titel ein.");
            return;
        }

        createCollectionMutation.mutate({ title, description, publicSubmissionsAllowed, isOwnerHidden }, {
            onSuccess: () => {
                router.refresh();
                setIsOpen(false);
                setTitle("");
                setDescription("");
                setPublicSubmissionsAllowed(false);
                setIsOwnerHidden(false);
                toast.success("Sammlung erfolgreich erstellt.");
            }
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="secondary" className={className}>
                    {children || "Neue Sammlung erstellen"}
                </Button>
            </SheetTrigger>
            <SheetFormContent
                title="Neue Sammlung erstellen"
                description="Bitte geben Sie die Details für die neue Sammlung ein."
                footer={
                    <>
                        <Button onClick={handleClick} disabled={createCollectionMutation.isPending}>
                            {createCollectionMutation.isPending ? "Erstelle..." : "Erstellen"}
                        </Button>
                        <SheetClose asChild>
                            <Button variant="outline">Abbrechen</Button>
                        </SheetClose>
                    </>
                }
            >
                <div className="grid gap-3">
                    <Label htmlFor="newCollectionTitle">Titel</Label>
                    <Input 
                        id="newCollectionTitle" 
                        placeholder="Titel der Sammlung" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="newCollectionDescription">Beschreibung</Label>
                    <Input 
                        id="newCollectionDescription" 
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
                        {createCollectionMutation.isError && (
                            <Alert variant="destructive">
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertTitle>Fehler beim Erstellen der Sammlung</AlertTitle>
                                <AlertDescription>
                                    <Code>{createCollectionMutation.error.message}</Code>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </SheetFormContent>
        </Sheet>
    );
}