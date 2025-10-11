"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from '@tanstack/react-query';

export function ProvisorischCreatePenName() {
    const trpc = useTRPC();
    const createPenNameMutation = useMutation(trpc.pennames.createPenName.mutationOptions());

    return (
        <div className="my-4 p-4">
            <div>Create Pen Name Component - Provisorisch</div>
            <form className="flex flex-col gap-4" onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get("penname");
                createPenNameMutation.mutateAsync({ name: name as string });
            }}>
                <Field>
                    <FieldLabel htmlFor="penname">Pen Name</FieldLabel>
                    <Input id="penname" name="penname" placeholder="BraveShark" autoComplete="off" required />
                </Field>
                <Field>
                    <Button type="submit" variant="default">
                        Create Pen Name
                    </Button>
                </Field>
            </form>
        </div>
    );
}
