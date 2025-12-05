import { db, penNames } from "@/lib/db/schema";
import { protectedProcedure, router } from "../init";
import { sql } from "drizzle-orm";
import z from "zod";
import { TRPCError } from "@trpc/server";

export const pennamesRouter = router({
    getAllPennames: protectedProcedure.query(async () => {
        const allPennames = await db.select().from(penNames);
        return allPennames;
    }),
    createPenName: protectedProcedure.input(
        z.object({
            name: z.string().min(3).max(50)
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
    getById: protectedProcedure.input(z.string()).query(async ({ input }) => {
        const penname = await db.select().from(penNames).where(sql`${penNames.id} = ${input}`).then(res => res[0]);
        if (!penname) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `Pen name with id '${input}' not found.`,
            });
        }
        return penname;
    }),
    getPenNamesByUserId: protectedProcedure.input(z.string()).query(async ({ input }) => {
        const pennames = await db.select().from(penNames).where(sql`${penNames.userId} = ${input}`);
        return pennames;
    })
});