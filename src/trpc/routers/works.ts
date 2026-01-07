import z from "zod";
import { protectedProcedure, adminProcedure, router } from "../init";
import { db, penNames, works, collections, collectionWorks, type Work, type PenName, type WorkWithPenName } from "@/lib/db/schema";
import { and, eq, not, or, isNotNull, notInArray, inArray, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import path from "path";
import { applyVisibility } from "@/lib/visibility";

const mapToWorkWithPenName = (row: { works: Work, pen_names: PenName }): WorkWithPenName => ({
    ...row.works,
    penName: row.pen_names
});


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


    generateAudio: adminProcedure
        .input(z.object({ workId: z.string(), voiceId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const work = await db.select().from(works).where(eq(works.id, input.workId)).then(res => res[0]);
            if (!work) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Work not found" });
            }
            if (!work.content) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Work has no content" });
            }

            const apiKey = process.env.ELEVENLABS_KEY;
            if (!apiKey) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "ELEVENLABS_KEY not configured" });
            }
            const model = process.env.ELEVENLABS_MODEL || "eleven_flash_v2_5";

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${input.voiceId}`, {
                method: "POST",
                headers: {
                    "Accept": "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": apiKey,
                },
                body: JSON.stringify({
                    text: work.content,
                    model_id: model,
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("ElevenLabs API Error:", errorText);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `ElevenLabs API Error: ${response.statusText}` });
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadsDir = path.join(process.cwd(), "uploads");
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const filePath = path.join(uploadsDir, `${input.workId}.mp3`);

            fs.writeFileSync(filePath, buffer);

            return { success: true };
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

    getMyWorks: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session!.user!.id!;
            const results = await db.select()
                .from(works)
                .innerJoin(penNames, eq(works.penNameId, penNames.id))
                .where(eq(penNames.userId, userId))
                .orderBy(desc(works.lastEditedDate));

            return results.map(mapToWorkWithPenName);
        }),

    getAllWorks: protectedProcedure
        .input(z.object({
            orderedBy: z.enum(["lastEditedDate", "creationDate", "publicationDate"]).optional()
        }).optional())
        .query(async ({ ctx, input }) => {
            const orderByField = input?.orderedBy === "creationDate" ? works.creationDate :
                input?.orderedBy === "publicationDate" ? works.publicationDate :
                    works.lastEditedDate;

            const results = await db.select()
                .from(works)
                .innerJoin(penNames, eq(works.penNameId, penNames.id))
                .orderBy(desc(orderByField));

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
            const isOwner = ctx.session!.user!.id! === input.userId;
            const whereClause = isOwner
                ? eq(penNames.userId, input.userId)
                : and(eq(penNames.userId, input.userId), isNotNull(penNames.revealDate));

            const results = await db.select()
                .from(works)
                .innerJoin(penNames, eq(works.penNameId, penNames.id))
                .where(whereClause)
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

            if (teaserDate === null) {
                const inOtherCollection = await db.select({ id: collections.id })
                    .from(collectionWorks)
                    .innerJoin(collections, eq(collectionWorks.collectionId, collections.id))
                    .where(and(
                        eq(collectionWorks.workId, id),
                        not(eq(collections.userId, userId))
                    ))
                    .limit(1)
                    .then(res => res.length > 0);

                if (inOtherCollection) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Cannot hide work (un-teaser) because it is in another user's collection"
                    });
                }
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