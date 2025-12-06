import { protectedProcedure, router } from "../init";
import { TRPCError } from "@trpc/server";
import { db, user_work_comments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import z from "zod";

export const commentsRouter = router({
    createComment: protectedProcedure
        .input(z.object({ workId: z.string(), content: z.string().min(1) }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            return await db.insert(user_work_comments).values({
                id: crypto.randomUUID(),
                userId,
                workId: input.workId,
                content: input.content,
            }).returning().then(res => res[0]);
        }),

    deleteComment: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            const comment = await db.select().from(user_work_comments).where(eq(user_work_comments.id, input.id)).then(res => res[0]);
            
            if (!comment) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
            }

            if (comment.userId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own comments" });
            }

            await db.delete(user_work_comments).where(eq(user_work_comments.id, input.id));
            return { success: true };
        }),

    updateComment: protectedProcedure
        .input(z.object({ id: z.string(), content: z.string().min(1) }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            const comment = await db.select().from(user_work_comments).where(eq(user_work_comments.id, input.id)).then(res => res[0]);

            if (!comment) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
            }

            if (comment.userId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You can only update your own comments" });
            }

            return await db.update(user_work_comments)
                .set({ content: input.content })
                .where(eq(user_work_comments.id, input.id))
                .returning()
                .then(res => res[0]);
        }),

    getCommentsByUserId: protectedProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            return await db.select()
                .from(user_work_comments)
                .where(eq(user_work_comments.userId, input.userId))
                .orderBy(desc(user_work_comments.creationDate));
        }),

    getCommentsByWorkId: protectedProcedure
        .input(z.object({ workId: z.string() }))
        .query(async ({ input }) => {
            return await db.select()
                .from(user_work_comments)
                .where(eq(user_work_comments.workId, input.workId))
                .orderBy(desc(user_work_comments.creationDate));
        }),

    getAllComments: protectedProcedure
        .query(async () => {
            return await db.select()
                .from(user_work_comments)
                .orderBy(desc(user_work_comments.creationDate));
        }),
});