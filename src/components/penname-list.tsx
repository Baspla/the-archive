import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { caller } from "@/trpc/server";

export async function PenNameList() {
    const pennames = await caller.pennames.getAllPennames()
    return (
        <>
            <div className="m-8 gap-4 flex flex-col">
                {pennames.map((penname) => (
                    <Item key={penname.id} variant="muted">
                        <ItemContent>
                            <ItemTitle>{penname.name}</ItemTitle>
                            <ItemDescription>Erfunden am {penname.creationDate.toLocaleDateString()}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            {penname.revealDate ? (
                                <Button variant="secondary" asChild>
                                    <Link href={`/users/${penname.userId}`}>User</Link>
                                </Button> 
                            ) : (
                                <Button variant="secondary" disabled>Versteckter Benutzer</Button>
                            )}
                            <Button variant="default" asChild>
                                <Link href={`/pennames/${penname.id}`}>Details</Link>
                            </Button>
                        </ItemActions>
                    </Item>
                ))}
            </div>
        </>
    );
}