import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RedactablePenNameWithUser } from "@/lib/db/schema";

export interface PenNameListProps {
    pennames: Array<RedactablePenNameWithUser>;
}


export async function PenNameList({ pennames }: PenNameListProps) {
    return (
        <>
            <div className="my-8 gap-4 flex flex-col">
                {pennames.map((penname) => (
                    <Item key={penname.id} variant="muted">
                        <ItemContent>
                            <ItemTitle>{penname.name}</ItemTitle>
                            <ItemDescription>Erfunden am {penname.creationDate.toLocaleDateString()}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            {penname.revealDate ? (
                                <Button variant="secondary" asChild>
                                    <Link href={`/users/${penname.user?.id}`}>{penname.user?.name}</Link>
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