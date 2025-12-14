import { type WorkWithPenName } from "@/lib/db/schema";

export const applyVisibility = (work: WorkWithPenName, currentUserId: string | undefined): WorkWithPenName | null => {
    const isAuthor = currentUserId && work.penName.userId === currentUserId;
    if (isAuthor) return work;

    if (!work.teaserDate) return null; // Not visible

    if (!work.publicationDate) {
        return {
            ...work,
            content: null,
            summary: null
        };
    }
    return work;
};
