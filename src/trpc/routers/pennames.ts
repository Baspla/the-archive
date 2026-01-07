import { db, PenName, penNames, RedactablePenNameWithUser, users, works } from "@/lib/db/schema";
import { protectedProcedure, router } from "../init";
import { sql, eq, asc, count } from "drizzle-orm";
import z from "zod";
import { TRPCError } from "@trpc/server";

const redactPenName = (penName: typeof penNames.$inferSelect, user: typeof users.$inferSelect | null, currentUserId: string, workCount: number): RedactablePenNameWithUser => {
    if (penName.userId === currentUserId) return { ...penName, user, workCount };
    if (!penName.revealDate) {
        return { ...penName, userId: null, user: null, workCount };
    }
    return { ...penName, user, workCount };
};

export const pennamesRouter = router({
    createPenName: protectedProcedure.input(
        z.object({
            name: z.string().trim().min(3).max(50)
        })).mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            return await db.insert(penNames).values({
                name: input.name,
                userId: userId
            }).returning().then(res => {
                return res[0];
            }).catch(err => {
                if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: `Pen name '${input.name}' already exists.`,
                    });
                } else {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: `Failed to create pen name '${input.name}': ${err.message}`,
                    });
                }
            })

        }),
    // For all getters.
    // If the current user is the owner of the pen name, return it unconditionally.
    // If not, redact the userId field if the revealDate is null.
    getPenNameById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const result = await db.select({
                pen_names: penNames,
                users: users,
                workCount: count(works.id)
            })
                .from(penNames)
                .leftJoin(users, eq(penNames.userId, users.id))
                .leftJoin(works, eq(penNames.id, works.penNameId))
                .where(eq(penNames.id, input.id))
                .groupBy(penNames.id)
                .then(res => res[0]);
            if (!result) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Pen name not found" });
            }
            return redactPenName(result.pen_names, result.users, ctx.session!.user!.id!, result.workCount);
        }),

    getAllPenNames: protectedProcedure
        .input(z.object({
            sort: z.enum(['name']).optional()
        }).optional())
        .query(async ({ input, ctx }) => {
            const query = db.select({
                pen_names: penNames,
                users: users,
                workCount: count(works.id)
            })
                .from(penNames)
                .leftJoin(users, eq(penNames.userId, users.id))
                .leftJoin(works, eq(penNames.id, works.penNameId))
                .groupBy(penNames.id);

            if (input?.sort === 'name') {
                query.orderBy(asc(penNames.name));
            }

            const results = await query;
            return results.map(row => redactPenName(row.pen_names, row.users, ctx.session!.user!.id!, row.workCount));
        }),

    getPenNamesByUserId: protectedProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input, ctx }) => {
            const results = await db.select({
                pen_names: penNames,
                users: users,
                workCount: count(works.id)
            })
                .from(penNames)
                .leftJoin(users, eq(penNames.userId, users.id))
                .leftJoin(works, eq(penNames.id, works.penNameId))
                .where(eq(penNames.userId, input.userId))
                .groupBy(penNames.id);
            return results.map(row => redactPenName(row.pen_names, row.users, ctx.session!.user!.id!, row.workCount));
        }),
    deletePenName: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            const penName = await db.select().from(penNames).where(eq(penNames.id, input.id)).then(res => res[0]);
            if (!penName) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Pen name not found" });
            }
            if (penName.userId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to delete this pen name" });
            }
            await db.delete(penNames).where(eq(penNames.id, input.id));
            return { success: true };
        }),
    updatePenName: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(3).max(50).optional(),
            revealDate: z.date().nullable().optional()
        })).mutation(async ({ input, ctx }) => {
            const userId = ctx.session!.user!.id!;
            const penName = await db.select().from(penNames).where(eq(penNames.id, input.id)).then(res => res[0]);
            if (!penName) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Pen name not found" });
            }
            if (penName.userId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to update this pen name" });
            }
            const updatedFields: Partial<PenName> = {};
            if (input.name !== undefined) {
                updatedFields.name = input.name;
            }
            if (input.revealDate !== undefined) {
                updatedFields.revealDate = input.revealDate;
            }
            await db.update(penNames).set(updatedFields).where(eq(penNames.id, input.id));
            const updatedPenName = await db.select().from(penNames).where(eq(penNames.id, input.id)).then(res => res[0]);
            return updatedPenName;
        })
});