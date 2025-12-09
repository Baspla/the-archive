import { Work } from "@/lib/db/schema";
import { TitleH2 } from "./title-h2";
import { Button } from "./ui/button";

export function WorkContentLink({ work }: { work: Work }) {
    if (!work.id) {
        return null;
    }
    if (!work.content) {
        return <Button variant="default" disabled >Es gibt noch nichts zu lesen</Button>;
    }
    return (
        <Button asChild variant="default">
            <a href={`/works/${work.id}/read`}>Lesen</a>
        </Button>
    );
}