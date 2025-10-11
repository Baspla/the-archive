"use client"

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TestButton() {
  return (
    <Button onClick={() => toast("Ehre!")}>Ehre!</Button>
  );
}