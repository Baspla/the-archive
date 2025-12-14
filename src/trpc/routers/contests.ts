import { protectedProcedure, router } from "../init";
import { TRPCError } from "@trpc/server";
import { db, contests, contestSubmissions, works, penNames, users, type WorkWithPenName } from "@/lib/db/schema";
import { eq, and, gte, lte,or, desc, sql, isNull, inArray } from "drizzle-orm";
import z from "zod";
import { applyVisibility } from "@/lib/visibility";


export const contestsRouter = router({
    createContest: protectedProcedure
        .input(z.object({
            title: z.string().min(1),
            description: z.string(),
            prompt: z.string().optional().default(""),
            rules: z.string(),
            submissionStartDate: z.date().optional(),
            submissionEndDate: z.date().optional(),
            promptRevealDate: z.date().optional(),
            publicationDate: z.date().optional()
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            return await db.insert(contests).values({
                creatorUserId: userId,
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
        // sets all works that have been submitted to public
    publicizeSubmissions: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            const contest = await db.select().from(contests).where(eq(contests.id, input.id)).then(res => res[0]);
            if (!contest) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Contest not found" });
            }
            if (contest.creatorUserId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You can only manage your own contests" });
            }
            const submissions = await db.select()
                .from(contestSubmissions)
                .where(eq(contestSubmissions.contestId, input.id));
            const workIds = submissions.map(s => s.workId);

            // set the publicationDate to now if not set
            // set the teaserDate to now if not set
            const now = new Date();
            const result = await db.update(works)
                .set({
                    publicationDate: sql`COALESCE(${works.publicationDate}, ${now.getTime()})`,
                    teaserDate: sql`COALESCE(${works.teaserDate}, ${now.getTime()})`
                })
                .where(inArray(works.id, workIds));
            return { count: result.changes };
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
            if (!contest.submissionStartDate ||now < contest.submissionStartDate) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Submissions are not open yet" });
            }
            if (contest.submissionEndDate && now > contest.submissionEndDate) {
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
            const results = await db.select({
                contest: contests,
                creator: users,
                submissionCount: sql<number>`count(${contestSubmissions.workId})`
            })
                .from(contests)
                .leftJoin(users, eq(contests.creatorUserId, users.id))
                .leftJoin(contestSubmissions, eq(contests.id, contestSubmissions.contestId))
                .where(eq(contests.creatorUserId, input.userId))
                .groupBy(contests.id)
                .orderBy(desc(contests.creationDate));

            return results.map(r => ({
                ...r.contest,
                creator: r.creator,
                submissionCount: r.submissionCount
            }));
        }),

    getContestsByWorkId: protectedProcedure
        .input(z.object({ workId: z.string() }))
        .query(async ({ input }) => {
            const results = await db.select({
                contest: contests,
                creator: users,
                submissionCount: sql<number>`(SELECT count(*) FROM ${contestSubmissions} WHERE ${contestSubmissions.contestId} = ${contests.id})`
            })
                .from(contestSubmissions)
                .innerJoin(contests, eq(contestSubmissions.contestId, contests.id))
                .leftJoin(users, eq(contests.creatorUserId, users.id))
                .where(eq(contestSubmissions.workId, input.workId));
            
            return results.map(r => ({
                ...r.contest,
                creator: r.creator,
                submissionCount: r.submissionCount
            }));
        }),

    getContestById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const contest = await db.select({
                contest: contests,
                creator: users
            })
            .from(contests)
            .leftJoin(users, eq(contests.creatorUserId, users.id))
            .where(eq(contests.id, input.id))
            .then(res => res[0]);

            if (!contest) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Contest not found" });
            }

            const submissions = await db.select({
                work: works,
                penName: penNames,
                submissionDate: contestSubmissions.creationDate
            })
            .from(contestSubmissions)
            .innerJoin(works, eq(contestSubmissions.workId, works.id))
            .innerJoin(penNames, eq(works.penNameId, penNames.id))
            .where(eq(contestSubmissions.contestId, input.id))
            .orderBy(desc(contestSubmissions.creationDate));

            const visibleSubmissions = submissions
                .map(s => {
                    const workWithPenName: WorkWithPenName = { ...s.work, penName: s.penName };
                    const visibleWork = applyVisibility(workWithPenName, ctx.session?.user?.id);
                    if (!visibleWork) return null;
                    return {
                        work: visibleWork,
                        addedBy: s.penName,
                        submissionDate: s.submissionDate
                    };
                })
                .filter((s): s is NonNullable<typeof s> => s !== null);

            return {
                ...contest.contest,
                creator: contest.creator,
                submissions: visibleSubmissions
            };
        }),

    getAllContests: protectedProcedure
        .query(async () => {
            const results = await db.select({
                contest: contests,
                creator: users,
                submissionCount: sql<number>`count(${contestSubmissions.workId})`
            })
                .from(contests)
                .leftJoin(users, eq(contests.creatorUserId, users.id))
                .leftJoin(contestSubmissions, eq(contests.id, contestSubmissions.contestId))
                .groupBy(contests.id)
                .orderBy(desc(contests.creationDate));
            
            return results.map(r => ({
                ...r.contest,
                creator: r.creator,
                submissionCount: r.submissionCount
            }));
        }),

    getAllActiveContests: protectedProcedure
        .query(async () => {
            const now = new Date();
            const results = await db.select({
                contest: contests,
                creator: users,
                submissionCount: sql<number>`count(${contestSubmissions.workId})`
            })
                .from(contests)
                .leftJoin(users, eq(contests.creatorUserId, users.id))
                .leftJoin(contestSubmissions, eq(contests.id, contestSubmissions.contestId))
                .where(or(
                    and(gte(contests.submissionEndDate, now), lte(contests.submissionStartDate, now)),
                    and(isNull(contests.submissionEndDate), lte(contests.submissionStartDate, now))
                ))
                .groupBy(contests.id)
                .orderBy(desc(contests.creationDate));
            return results.map(r => ({
                ...r.contest,
                creator: r.creator,
                submissionCount: r.submissionCount
            }));
        })
});