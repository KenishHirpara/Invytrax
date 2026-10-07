import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const userId = user.id;

      if (!userId) {
        throw new Error("User ID not found in session");
      }

      const updated = await db
        .update(users)
        .set({
          name: input.name,
          email: input.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      return updated[0];
    }),
});
