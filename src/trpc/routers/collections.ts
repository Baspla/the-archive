import { protectedProcedure, router } from "../init";
import { TRPCError } from "@trpc/server";
import { db, collections, collectionWorks, penNames, works, users, type Collection } from "@/lib/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import z from "zod";

const cleanCollection = (collection: Collection) => {
    if (collection.ownerHiddenDate) {
        return { ...collection, userId: null };
    }
    return collection;
};

export const collectionsRouter = router({
    createCollection: protectedProcedure
        .input(z.object({
            title: z.string().min(1),
            description: z.string(),
            publicSubmissionsAllowed: z.boolean().default(false),
            isOwnerHidden: z.boolean().default(false)
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            return await db.insert(collections).values({
                userId,
                title: input.title,
                description: input.description,
                publicSubmissionsAllowed: input.publicSubmissionsAllowed,
                ownerHiddenDate: input.isOwnerHidden ? new Date() : null
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
            publicSubmissionsAllowed: z.boolean().optional(),
            isOwnerHidden: z.boolean().optional()
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

            const updateData: Partial<typeof collections.$inferInsert> = {
                title: input.title,
                description: input.description,
                publicSubmissionsAllowed: input.publicSubmissionsAllowed
            };

            if (input.isOwnerHidden !== undefined) {
                updateData.ownerHiddenDate = input.isOwnerHidden ? new Date() : null;
            }

            return await db.update(collections)
                .set(updateData)
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

            if (collection.userId !== userId && !work.teaserDate) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Cannot add a hidden work to another user's collection" });
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
            const res = await db.select()
                .from(collections)
                .where(eq(collections.userId, userId))
                .orderBy(desc(collections.creationDate));
            return res.map(cleanCollection);
        }),

    getCollectionsByWorkId: protectedProcedure
        .input(z.object({ workId: z.string() }))
        .query(async ({ input }) => {
            const results = await db.select({
                collection: collections,
                addedBy: penNames,
                user: {
                    name: users.name,
                    image: users.image,
                    id: users.id
                },
                workCount: sql<number>`(SELECT count(*) FROM ${collectionWorks} WHERE ${collectionWorks.collectionId} = ${collections.id})`
            })
                .from(collectionWorks)
                .innerJoin(collections, eq(collectionWorks.collectionId, collections.id))
                .innerJoin(penNames, eq(collectionWorks.addedByPenNameId, penNames.id))
                .leftJoin(users, eq(collections.userId, users.id))
                .where(eq(collectionWorks.workId, input.workId));
            
            return results.map(r => {
                const cleaned = cleanCollection(r.collection);
                return {
                    ...cleaned,
                    addedByPenName: r.addedBy,
                    user: cleaned.userId ? r.user : null,
                    workCount: r.workCount
                };
            });
        }),

    getCollectionsByUserId: protectedProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input, ctx }) => {
            const currentUserId = ctx.session?.user?.id;
            
            const conditions = [eq(collections.userId, input.userId)];
            
            if (currentUserId !== input.userId) {
                conditions.push(sql`${collections.ownerHiddenDate} IS NULL`);
            }

            const res = await db.select({
                collection: collections,
                user: {
                    name: users.name,
                    image: users.image,
                    id: users.id
                },
                workCount: sql<number>`count(${collectionWorks.workId})`
            })
                .from(collections)
                .leftJoin(users, eq(collections.userId, users.id))
                .leftJoin(collectionWorks, eq(collections.id, collectionWorks.collectionId))
                .where(and(...conditions))
                .groupBy(collections.id)
                .orderBy(desc(collections.creationDate));

            return res.map(({ collection, user, workCount }) => {
                const cleaned = cleanCollection(collection);
                return {
                    ...cleaned,
                    user: cleaned.userId ? user : null,
                    workCount
                };
            });
        }),

    getCollectionById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const currentUserId = ctx.session?.user?.id;
            const collection = await db.select({
                collection: collections,
                user: {
                    name: users.name,
                    image: users.image,
                    id: users.id
                }
            })
                .from(collections)
                .leftJoin(users, eq(collections.userId, users.id))
                .where(eq(collections.id, input.id))
                .then(res => res[0]);

            if (!collection) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Collection not found" });
            }

            const worksInCollection = await db.select({
                work: works,
                addedBy: penNames,
                addedDate: collectionWorks.addedDate
            })
                .from(collectionWorks)
                .innerJoin(works, eq(collectionWorks.workId, works.id))
                .innerJoin(penNames, eq(collectionWorks.addedByPenNameId, penNames.id))
                .where(eq(collectionWorks.collectionId, input.id))
                .orderBy(desc(collectionWorks.addedDate));

            let cleanedCollection = collection.collection;
            if (collection.collection.userId !== currentUserId) {
                cleanedCollection = cleanCollection(collection.collection);
            }

            return {
                ...cleanedCollection,
                user: cleanedCollection.userId ? collection.user : null,
                works: worksInCollection
            };
        }),

    getAllCollections: protectedProcedure
        .input(z.object({
            orderedBy: z.enum(["creationDate", "title"]).optional()
        }).optional())
        .query(async ({ input }) => {
            const orderByClause = input?.orderedBy === "title" ? asc(collections.title) : desc(collections.creationDate);

            const res = await db.select({
                collection: collections,
                user: {
                    name: users.name,
                    image: users.image,
                    id: users.id
                },
                workCount: sql<number>`count(${collectionWorks.workId})`
            })
                .from(collections)
                .leftJoin(users, eq(collections.userId, users.id))
                .leftJoin(collectionWorks, eq(collections.id, collectionWorks.collectionId))
                .groupBy(collections.id)
                .orderBy(orderByClause);

            return res.map(({ collection, user, workCount }) => {
                const cleaned = cleanCollection(collection);
                return {
                    ...cleaned,
                    user: cleaned.userId ? user : null,
                    workCount
                };
            });
        }),
});