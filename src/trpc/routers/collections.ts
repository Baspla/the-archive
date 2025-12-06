import { protectedProcedure, router } from "../init";
import { TRPCError } from "@trpc/server";
import { db, collections, collectionWorks, penNames, works } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import z from "zod";

export const collectionsRouter = router({
    createCollection: protectedProcedure
        .input(z.object({
            title: z.string().min(1),
            description: z.string(),
            publicSubmissionsAllowed: z.boolean().default(false)
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            return await db.insert(collections).values({
                userId,
                title: input.title,
                description: input.description,
                publicSubmissionsAllowed: input.publicSubmissionsAllowed
            }).returning().then(res => res[0]);
        }),

    deleteCollection: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            const collection = await db.select().from(collections).where(eq(collections.id, input.id)).then(res => res[0]);

            if (!collection) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Collection not found" });
            }

            if (collection.userId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own collections" });
            }

            await db.delete(collections).where(eq(collections.id, input.id));
            return { success: true };
        }),

    updateCollection: protectedProcedure
        .input(z.object({
            id: z.string(),
            title: z.string().optional(),
            description: z.string().optional(),
            publicSubmissionsAllowed: z.boolean().optional()
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            const collection = await db.select().from(collections).where(eq(collections.id, input.id)).then(res => res[0]);

            if (!collection) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Collection not found" });
            }

            if (collection.userId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You can only update your own collections" });
            }

            return await db.update(collections)
                .set({
                    title: input.title,
                    description: input.description,
                    publicSubmissionsAllowed: input.publicSubmissionsAllowed
                })
                .where(eq(collections.id, input.id))
                .returning()
                .then(res => res[0]);
        }),

    addWorkToCollection: protectedProcedure
        .input(z.object({
            collectionId: z.string(),
            workId: z.string(),
            penNameId: z.string()
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            
            // Check collection
            const collection = await db.select().from(collections).where(eq(collections.id, input.collectionId)).then(res => res[0]);
            if (!collection) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Collection not found" });
            }

            // Check pen name ownership
            const penName = await db.select().from(penNames).where(and(eq(penNames.id, input.penNameId), eq(penNames.userId, userId))).then(res => res[0]);
            if (!penName) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You do not own this pen name" });
            }

            // Check permissions: Owner OR Public Submissions
            if (collection.userId !== userId && !collection.publicSubmissionsAllowed) {
                throw new TRPCError({ code: "FORBIDDEN", message: "This collection does not accept public submissions" });
            }

            // Check if work exists (optional but good)
            const work = await db.select().from(works).where(eq(works.id, input.workId)).then(res => res[0]);
            if (!work) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Work not found" });
            }

            try {
                await db.insert(collectionWorks).values({
                    collectionId: input.collectionId,
                    workId: input.workId,
                    addedByPenNameId: input.penNameId
                });
            } catch (error: any) {
                if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                    return { success: true }; // Already added
                }
                throw error;
            }
            return { success: true };
        }),

    removeWorkFromCollection: protectedProcedure
        .input(z.object({ collectionId: z.string(), workId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            
            const collection = await db.select().from(collections).where(eq(collections.id, input.collectionId)).then(res => res[0]);
            if (!collection) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Collection not found" });
            }

            const collectionWork = await db.select()
                .from(collectionWorks)
                .where(and(eq(collectionWorks.collectionId, input.collectionId), eq(collectionWorks.workId, input.workId)))
                .then(res => res[0]);

            if (!collectionWork) {
                return { success: true }; // Already removed
            }

            // Check if user is collection owner
            const isCollectionOwner = collection.userId === userId;

            // Check if user is the one who added the work (via pen name)
            const addedByPenName = await db.select().from(penNames).where(eq(penNames.id, collectionWork.addedByPenNameId)).then(res => res[0]);
            const isSubmitter = addedByPenName && addedByPenName.userId === userId;

            if (!isCollectionOwner && !isSubmitter) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You can only remove works you submitted or from your own collections" });
            }

            await db.delete(collectionWorks)
                .where(and(eq(collectionWorks.collectionId, input.collectionId), eq(collectionWorks.workId, input.workId)));
            
            return { success: true };
        }),

    getCollectionsByUserId: protectedProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            return await db.select()
                .from(collections)
                .where(eq(collections.userId, input.userId))
                .orderBy(desc(collections.creationDate));
        }),

    getCollectionsByWorkId: protectedProcedure
        .input(z.object({ workId: z.string() }))
        .query(async ({ input }) => {
            const results = await db.select({
                collection: collections,
                addedBy: penNames
            })
                .from(collectionWorks)
                .innerJoin(collections, eq(collectionWorks.collectionId, collections.id))
                .innerJoin(penNames, eq(collectionWorks.addedByPenNameId, penNames.id))
                .where(eq(collectionWorks.workId, input.workId));
            
            return results.map(r => ({
                ...r.collection,
                addedByPenName: r.addedBy
            }));
        }),

    getAllCollections: protectedProcedure
        .query(async () => {
            return await db.select()
                .from(collections)
                .orderBy(desc(collections.creationDate));
        }),
});