import z from "zod";
import { protectedProcedure, router } from "../init";
import { db, penNames, works, type Work, type PenName } from "@/lib/db/schema";
import { and, eq, not, or, isNotNull, notInArray, inArray, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

type WorkWithPenName = Work & { penName: PenName };

const mapToWorkWithPenName = (row: { works: Work, pen_names: PenName }): WorkWithPenName => ({
    ...row.works,
    penName: row.pen_names
});

const applyVisibility = (work: WorkWithPenName, currentUserId: string): WorkWithPenName | null => {
    const isAuthor = work.penName.userId === currentUserId;
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

export const worksRouter = router({
    createWork: protectedProcedure.input(
        z.object({ pennameid: z.string(), title: z.string().optional() })
    ).mutation(async ({ input, ctx }) => {
        const { pennameid, title } = input;
        const userId = ctx.session!.user!.id!;
        // check if pennameid belongs to user
        const penname = await db.select().from(penNames).where(and(eq(penNames.id, pennameid), eq(penNames.userId, userId))).then(res => res[0]);
        if (!penname) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: `The user does not own the pen name with id '${pennameid}'.`,
            });
        }
        return await db.insert(works).values({
            penNameId: penname.id,
            title: title
        });
    }),
    // For all getters.
    // If work is authored by the requesting user, return it unconditionally.
    // If not, only return it if it is teasered (teaseredAt is not null).
    // And only return content and summary to non-authors if published (publishedAt is not null).
    getWorkById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const result = await db.select()
                .from(works)
                .innerJoin(penNames, eq(works.penNameId, penNames.id))
                .where(eq(works.id, input.id))
                .then(res => res[0]);

            if (!result) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Work not found" });
            }

            const work = mapToWorkWithPenName(result);
            const visibleWork = applyVisibility(work, ctx.session!.user!.id!);

            if (!visibleWork) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Work not found" });
            }

            return visibleWork;
        }),

    getAllWorks: protectedProcedure
        .query(async ({ ctx }) => {
            const results = await db.select()
                .from(works)
                .innerJoin(penNames, eq(works.penNameId, penNames.id))
                .orderBy(desc(works.lastEditedDate));

            return results
                .map(mapToWorkWithPenName)
                .map(w => applyVisibility(w, ctx.session!.user!.id!))
                .filter((w): w is WorkWithPenName => w !== null);
        }),

    getWorksByPenNameId: protectedProcedure
        .input(z.object({ penNameId: z.string() }))
        .query(async ({ input, ctx }) => {
            const results = await db.select()
                .from(works)
                .innerJoin(penNames, eq(works.penNameId, penNames.id))
                .where(eq(works.penNameId, input.penNameId))
                .orderBy(desc(works.lastEditedDate));

            return results
                .map(mapToWorkWithPenName)
                .map(w => applyVisibility(w, ctx.session!.user!.id!))
                .filter((w): w is WorkWithPenName => w !== null);
        }),

    getWorksByUserId: protectedProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input, ctx }) => {
            const results = await db.select()
                .from(works)
                .innerJoin(penNames, eq(works.penNameId, penNames.id))
                .where(eq(penNames.userId, input.userId))
                .orderBy(desc(works.lastEditedDate));

            return results
                .map(mapToWorkWithPenName)
                .map(w => applyVisibility(w, ctx.session!.user!.id!))
                .filter((w): w is WorkWithPenName => w !== null);
        }),
    deleteWork: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            const result = await db.select()
                .from(works)
                .innerJoin(penNames, eq(works.penNameId, penNames.id))
                .where(eq(works.id, input.id))
                .then(res => res[0]);
            if (!result) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Work not found" });
            }
            const work = mapToWorkWithPenName(result);
            if (work.penName.userId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to delete this work" });
            }
            await db.delete(works).where(eq(works.id, input.id));
            return { success: true };
        }),
    updateWork: protectedProcedure.input(
        z.object({
            id: z.string(),
            title: z.string().optional(),
            content: z.string().optional(),
            summary: z.string().optional(),
            teaserDate: z.date().nullable().optional(),
            publicationDate: z.date().nullable().optional()
        })).mutation(async ({ input, ctx }) => {
            const { id, title, content, summary, teaserDate, publicationDate } = input;
            const userId = ctx.session!.user!.id!;
            const result = await db.select()
                .from(works)
                .innerJoin(penNames, eq(works.penNameId, penNames.id))
                .where(eq(works.id, id))
                .then(res => res[0]);
            if (!result) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Work not found" });
            }
            const work = mapToWorkWithPenName(result);
            if (work.penName.userId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to update this work" });
            }
            await db.update(works).set({
                title: title !== undefined ? title : work.title,
                content: content !== undefined ? content : work.content,
                summary: summary !== undefined ? summary : work.summary,
                teaserDate: teaserDate !== undefined ? teaserDate : work.teaserDate,
                publicationDate: publicationDate !== undefined ? publicationDate : work.publicationDate,
                lastEditedDate: new Date()
            }).where(eq(works.id, id));
            return { success: true };
        })
});