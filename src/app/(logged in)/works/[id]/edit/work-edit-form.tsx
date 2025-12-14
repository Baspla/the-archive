"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { WorkWithPenName } from "@/lib/db/schema";

interface WorkEditFormProps {
  work: WorkWithPenName;
}

export function WorkEditForm({ work }: WorkEditFormProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const updateWorkMutation = useMutation(trpc.works.updateWork.mutationOptions());

  const [title, setTitle] = useState(work.title || "");
  const [summary, setSummary] = useState(work.summary || "");
  const [content, setContent] = useState(work.content || "");
  const [teaserDate, setTeaserDate] = useState<Date | null>(work.teaserDate ? new Date(work.teaserDate) : null);
  const [publicationDate, setPublicationDate] = useState<Date | null>(work.publicationDate ? new Date(work.publicationDate) : null);

  const handleSave = () => {
    updateWorkMutation.mutate(
      {
        id: work.id,
        title,
        summary,
        content,
        teaserDate,
        publicationDate,
      },
      {
        onSuccess: () => {
          toast.success("Werk erfolgreich gespeichert");
          router.refresh();
          router.push(`/works/${work.id}`);
        },
        onError: (error) => {
          toast.error(`Fehler beim Speichern: ${error.message}`);
        },
      }
    );
  };

  const toggleTeaser = () => {
    if (teaserDate) {
      setTeaserDate(null);
      setPublicationDate(null); // Removing teaser also removes publication
    } else {
      setTeaserDate(new Date());
    }
  };

  const togglePublication = () => {
    if (publicationDate) {
      setPublicationDate(null);
    } else {
      setPublicationDate(new Date());
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 border p-4 rounded-md">
        <h3 className="text-lg font-medium">Veröffentlichung</h3>
        <p className="text-sm text-muted-foreground">
          Teasern bedeutet, dass nur der Titel für alle Leser sichtbar ist.
          <br/>
          Erst wenn du den Inhalt veröffentlichst, kann dieser und die Zusammenfassung gelesen werden.
        </p>        
        <div className="flex items-center justify-between">
            <div>
                <Label>Teaser</Label>
                <div className="text-sm text-muted-foreground">
                    {teaserDate ? `Veröffentlicht am ${teaserDate.toLocaleDateString("de-DE")}` : "Nicht veröffentlicht"}
                </div>
            </div>
            <Button 
                variant={teaserDate ? "destructive" : "default"}
                onClick={toggleTeaser}
                type="button"
            >
                {teaserDate ? "Teaser zurückziehen" : "Teaser veröffentlichen"}
            </Button>
        </div>

        <div className="flex items-center justify-between">
            <div>
                <Label>Inhalt</Label>
                <div className="text-sm text-muted-foreground">
                    {publicationDate ? `Veröffentlicht am ${publicationDate.toLocaleDateString("de-DE")}` : "Nicht veröffentlicht"}
                </div>
            </div>
            <Button 
                variant={publicationDate ? "destructive" : "default"}
                disabled={!teaserDate && !publicationDate}
                onClick={togglePublication}
                type="button"
            >
                {publicationDate ? "Veröffentlichung zurückziehen" : "Inhalt veröffentlichen"}
            </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titel des Werkes"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Zusammenfassung</Label>
        <textarea
          id="summary"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Eine kurze Zusammenfassung..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Inhalt</Label>
        <textarea
          id="content"
          className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Hier den Inhalt schreiben..."
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Abbrechen
        </Button>
        <Button onClick={handleSave} disabled={updateWorkMutation.isPending}>
          {updateWorkMutation.isPending ? "Speichert..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
}
