import z from "zod";
import { protectedProcedure, router } from "../init";
import { db,penNames, works} from "@/lib/db/schema";
import { and, eq, not, or, isNotNull, notInArray, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const worksRouter = router({
    createWork: protectedProcedure.input(
        z.object({pennameid: z.string()})
    ).mutation(async ({input, ctx}) => {
        const { pennameid } = input;
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
                penNameId: penname.id
            });
    }),
    getAllTeasedAndPublishedWorksByOthers: protectedProcedure.query(async ({ctx}) => {
        const userId = ctx.session!.user!.id!;
        
        const userPenNamesSubquery = db.select({ id: penNames.id }).from(penNames).where(eq(penNames.userId, userId));

        return await db.select().from(works).where(
            and(
                or(isNotNull(works.teaserDate), isNotNull(works.publicationDate)),
                notInArray(works.penNameId, userPenNamesSubquery)
            )
        );
    }),
    getAllWorksForUser: protectedProcedure.query(async ({ctx}) => {
        const userId = ctx.session!.user!.id!;
        const userPenNamesSubquery = db.select({ id: penNames.id }).from(penNames).where(eq(penNames.userId, userId));

        return await db.select().from(works).where(
            inArray(works.penNameId, userPenNamesSubquery)
        );
    })
});