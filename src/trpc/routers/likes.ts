import { protectedProcedure, router } from "../init";
import { TRPCError } from "@trpc/server";
import { db, user_work_likes } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import z from "zod";

// Likes are between users and works.
export const likesRouter = router({
    createLike: protectedProcedure
        .input(z.object({ workId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            try {
                await db.insert(user_work_likes).values({
                    userId,
                    workId: input.workId,
                });
            } catch (error: any) {
                if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                    return { success: true };
                }
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
            }
            return { success: true };
        }),

    deleteLike: protectedProcedure
        .input(z.object({ workId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            await db.delete(user_work_likes)
                .where(and(
                    eq(user_work_likes.userId, userId),
                    eq(user_work_likes.workId, input.workId)
                ));
            return { success: true };
        }),

    getLikesByUserId: protectedProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            return await db.select()
                .from(user_work_likes)
                .where(eq(user_work_likes.userId, input.userId));
        }),

    getLikesByWorkId: protectedProcedure
        .input(z.object({ workId: z.string() }))
        .query(async ({ input }) => {
            return await db.select()
                .from(user_work_likes)
                .where(eq(user_work_likes.workId, input.workId));
        }),

    getAllLikes: protectedProcedure
        .query(async () => {
            return await db.select().from(user_work_likes);
        }),
});