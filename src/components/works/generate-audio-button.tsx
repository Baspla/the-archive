"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const VOICES = [
  { name: "Lily", id: "pFZP5JQG7iQjIQuC4Bku" },
  { name: "Callum", id: "N2lVS1w4EtoT3dr4eOWO" },
  { name: "Daniel", id: "onwK4e9ZLuTAKqWW03F9" },
  { name: "Matilda", id: "XrExE9yKIg1WjnnlVkGX" },
  { name: "Helmut", id: "5KvpaGteYkNayiswuX2h" },
  { name: "Lana", id: "rAmra0SCIYOxYmRNDSm3" },
];

interface GenerateAudioButtonProps {
  workId: string;
}

export function GenerateAudioButton({ workId }: GenerateAudioButtonProps) {
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const router = useRouter();
  const trpc = useTRPC();

  const generateAudio = useMutation({
    ...trpc.works.generateAudio.mutationOptions(),
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleGenerate = () => {
    generateAudio.mutate({
      workId,
      voiceId: selectedVoice,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a voice" />
        </SelectTrigger>
        <SelectContent>
          {VOICES.map((voice) => (
            <SelectItem key={voice.id} value={voice.id}>
              {voice.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        onClick={handleGenerate} 
        disabled={generateAudio.isPending}
        variant="outline"
      >
        {generateAudio.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate Audio
      </Button>
    </div>
  );
}
