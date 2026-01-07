import { Work } from "@/lib/db/schema";
import { TitleH2 } from "@/components/typography/title-h2";
import { Button } from "@/components/ui/button";

export function WorkContentLink({ work }: { work: Work }) {
    if (!work.id) {
        return null;
    }
    if (!work.content) {
        return <Button variant="default" disabled >Es gibt noch nichts zu lesen</Button>;
    }
    return (
        <Button asChild variant="default" size="lg" className="text-xl">
            <a href={`/works/${work.id}/read`}>Jetzt lesen</a>
        </Button>
    );
}