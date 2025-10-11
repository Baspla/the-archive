import { protectedProcedure, publicProcedure, router } from "../init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const usersRouter = router({
    getUserById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const user = await db.select().from(users).where(eq(users.id, input.id)).get();
            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `No user with id '${input.id}'`,
                });
            }
            return user;
        }),
    getAllUsers: protectedProcedure.query(async () => {
        const allUsers = await db.select().from(users).all();
        return allUsers;
    }),
});
