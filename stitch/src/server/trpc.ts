import { auth } from "@/auth";
import { db } from "@/db";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

/**
 * Context — created per request
 * Embeds: db, session user (id, role, warehouseIds)
 */
export async function createTRPCContext(opts: { headers: Headers }) {
  const session = await auth();

  return {
    db,
    session,
    user: session?.user ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// ─── Procedures ───────────────────────────────────────────────────────────────

/** Public — no auth required */
export const publicProcedure = t.procedure;

/** Protected — any authenticated user */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

/** Manager only */
export const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user!.role !== "manager") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});
