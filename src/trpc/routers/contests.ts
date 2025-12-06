import { protectedProcedure, router } from "../init";
import { TRPCError } from "@trpc/server";
import { db, contests, contestSubmissions, works, penNames } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import z from "zod";

export const contestsRouter = router({
    createContest: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            title: z.string().min(1),
            description: z.string(),
            prompt: z.string(),
            rules: z.string(),
            submissionStartDate: z.date(),
            submissionEndDate: z.date(),
            promptRevealDate: z.date(),
            publicationDate: z.date().optional()
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            return await db.insert(contests).values({
                creatorUserId: userId,
                name: input.name,
                title: input.title,
                description: input.description,
                prompt: input.prompt,
                rules: input.rules,
                submissionStartDate: input.submissionStartDate,
                submissionEndDate: input.submissionEndDate,
                promptRevealDate: input.promptRevealDate,
                publicationDate: input.publicationDate
            }).returning().then(res => res[0]);
        }),

    deleteContest: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            const contest = await db.select().from(contests).where(eq(contests.id, input.id)).then(res => res[0]);

            if (!contest) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Contest not found" });
            }

            if (contest.creatorUserId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own contests" });
            }

            await db.delete(contests).where(eq(contests.id, input.id));
            return { success: true };
        }),

    updateContest: protectedProcedure
        .input(z.object({
            id: z.string(),
            title: z.string().optional(),
            description: z.string().optional(),
            prompt: z.string().optional(),
            rules: z.string().optional(),
            submissionStartDate: z.date().optional(),
            submissionEndDate: z.date().optional(),
            promptRevealDate: z.date().optional(),
            publicationDate: z.date().optional()
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            const contest = await db.select().from(contests).where(eq(contests.id, input.id)).then(res => res[0]);

            if (!contest) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Contest not found" });
            }

            if (contest.creatorUserId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You can only update your own contests" });
            }

            return await db.update(contests)
                .set({
                    title: input.title,
                    description: input.description,
                    prompt: input.prompt,
                    rules: input.rules,
                    submissionStartDate: input.submissionStartDate,
                    submissionEndDate: input.submissionEndDate,
                    promptRevealDate: input.promptRevealDate,
                    publicationDate: input.publicationDate,
                    lastEditedDate: new Date()
                })
                .where(eq(contests.id, input.id))
                .returning()
                .then(res => res[0]);
        }),

    addWorkToContest: protectedProcedure
        .input(z.object({ contestId: z.string(), workId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            const now = new Date();

            const contest = await db.select().from(contests).where(eq(contests.id, input.contestId)).then(res => res[0]);
            if (!contest) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Contest not found" });
            }

            // Check submission window
            if (now < contest.submissionStartDate) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Submissions are not open yet" });
            }
            if (now > contest.submissionEndDate) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Submissions are closed" });
            }

            // Check work ownership
            const work = await db.select()
                .from(works)
                .innerJoin(penNames, eq(works.penNameId, penNames.id))
                .where(eq(works.id, input.workId))
                .then(res => res[0]);

            if (!work) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Work not found" });
            }

            if (work.pen_names.userId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You can only submit your own works" });
            }

            try {
                await db.insert(contestSubmissions).values({
                    contestId: input.contestId,
                    workId: input.workId
                });
            } catch (error: any) {
                if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                    return { success: true };
                }
                throw error;
            }
            return { success: true };
        }),

    removeWorkFromContest: protectedProcedure
        .input(z.object({ contestId: z.string(), workId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            
            const contest = await db.select().from(contests).where(eq(contests.id, input.contestId)).then(res => res[0]);
            if (!contest) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Contest not found" });
            }

            const submission = await db.select()
                .from(contestSubmissions)
                .where(and(eq(contestSubmissions.contestId, input.contestId), eq(contestSubmissions.workId, input.workId)))
                .then(res => res[0]);

            if (!submission) {
                return { success: true };
            }

            // Check if user is contest creator
            const isCreator = contest.creatorUserId === userId;

            // Check if user is work owner
            const work = await db.select()
                .from(works)
                .innerJoin(penNames, eq(works.penNameId, penNames.id))
                .where(eq(works.id, input.workId))
                .then(res => res[0]);
            
            const isOwner = work && work.pen_names.userId === userId;

            if (!isCreator && !isOwner) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You can only remove your own submissions or manage your contest" });
            }

            // If owner is removing, check if submissions are still open? 
            // Usually you can withdraw anytime, or maybe not after deadline. 
            // Let's allow withdrawal anytime for now unless specified otherwise.

            await db.delete(contestSubmissions)
                .where(and(eq(contestSubmissions.contestId, input.contestId), eq(contestSubmissions.workId, input.workId)));
            
            return { success: true };
        }),

    getContestsByUserId: protectedProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            return await db.select()
                .from(contests)
                .where(eq(contests.creatorUserId, input.userId))
                .orderBy(desc(contests.creationDate));
        }),

    getContestsByWorkId: protectedProcedure
        .input(z.object({ workId: z.string() }))
        .query(async ({ input }) => {
            const results = await db.select({
                contest: contests
            })
                .from(contestSubmissions)
                .innerJoin(contests, eq(contestSubmissions.contestId, contests.id))
                .where(eq(contestSubmissions.workId, input.workId));
            
            return results.map(r => r.contest);
        }),

    getAllContests: protectedProcedure
        .query(async () => {
            return await db.select()
                .from(contests)
                .orderBy(desc(contests.creationDate));
        }),
});