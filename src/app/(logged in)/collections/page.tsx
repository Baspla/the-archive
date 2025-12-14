import { auth } from "@/auth";
import { CollectionGrid } from "@/components/collection-grid";
import { CollectionShelf } from "@/components/collection-shelf";
import { ContentArea } from "@/components/content-area";
import H1 from "@/components/typography/h1";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import CreateCollectionButton from "@/components/create-collection-button";
import { TitleH2 } from "@/components/typography/title-h2";

export default async function CollectionsPage() {
    const session = await auth();
    if (!session) {
        redirect(`/login?callbackUrl=/collections`);
        return null;
    }

    const allCollections = await caller.collections.getAllCollections();

    return (
        <>
            <ContentArea>
                <H1>
                    Sammlungen
                </H1>
                <p className="mb-4">
                    Eine Sammlung kann für Thematisch gleiche Werke sein, eine Reihe an zusammengehörigen Geschichten.
                    <br />Auch Wettbewerbe können als Sammlung organisiert werden, solange ich das Feature noch nicht eingebaut habe. 😅
                    <br />Du kannst einstellen, ob andere Nutzer Werke zu deiner Sammlung hinzufügen dürfen oder nicht.
                </p>

                <CreateCollectionButton className="self-start mb-8">
                    Neue Sammlung erstellen
                </CreateCollectionButton>
                <TitleH2>Alle Sammlungen</TitleH2>
                <CollectionGrid collections={allCollections} />
            </ContentArea>
        </>
    );
}