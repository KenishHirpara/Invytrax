import { z } from "zod";
import { createTRPCRouter, protectedProcedure, managerProcedure } from "@/server/trpc";
import { warehouses, locations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const warehousesRouter = createTRPCRouter({
  /** List all warehouses (manager: all, staff: their assigned) */
  list: protectedProcedure.query(async ({ ctx }) => {
    const { user, db } = ctx;
    if (user!.role === "manager") {
      return db.query.warehouses.findMany({
        with: { locations: true },
        where: eq(warehouses.isActive, true),
        orderBy: (w, { asc }) => [asc(w.name)],
      });
    }
    // Staff: only assigned warehouses
    if (!user!.warehouseIds.length) return [];
    return db.query.warehouses.findMany({
      where: (w, { inArray }) => inArray(w.id, user!.warehouseIds),
      with: { locations: true },
      orderBy: (w, { asc }) => [asc(w.name)],
    });
  }),

  /** Get single warehouse by id */
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Staff scope guard
      if (ctx.user!.role === "staff" && !ctx.user!.warehouseIds.includes(input.id)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const wh = await ctx.db.query.warehouses.findFirst({
        where: eq(warehouses.id, input.id),
        with: { locations: true },
      });
      if (!wh) throw new TRPCError({ code: "NOT_FOUND" });
      return wh;
    }),

  /** Create warehouse (manager only) */
  create: managerProcedure
    .input(z.object({
      name: z.string().min(1),
      shortCode: z.string().min(1).max(20),
      address: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Drizzle + Neon can occasionally choke on explicit `undefined` -> `DEFAULT` prepared params
      const values = { ...input };
      if (!values.address) delete values.address;

      const [wh] = await ctx.db.insert(warehouses).values(values).returning();
      
      // Auto-create default stock location
      await ctx.db.insert(locations).values({
        warehouseId: wh!.id,
        name: "WH/Stock",
        code: `${input.shortCode}/STK`,
      });
      return wh;
    }),

  /** Add sub-location to a warehouse */
  addLocation: managerProcedure
    .input(z.object({
      warehouseId: z.string().uuid(),
      name: z.string().min(1),
      code: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const values = { ...input };
      if (!values.code) delete values.code;
      const [loc] = await ctx.db.insert(locations).values(values).returning();
      return loc;
    }),

  /**
   * listLocations — flat list of all locations (across all accessible warehouses).
   * Used by dropdowns in new-receipt, new-delivery, and new-product forms.
   */
  listLocations: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    const whs = user!.role === "manager"
      ? await db.query.warehouses.findMany({
          where: (w, { eq }) => eq(w.isActive, true),
          with: { locations: true },
        })
      : user!.warehouseIds.length
        ? await db.query.warehouses.findMany({
            where: (w, { inArray }) => inArray(w.id, user!.warehouseIds),
            with: { locations: true },
          })
        : [];

    // Flatten and annotate with warehouse name for readability in dropdowns
    return whs.flatMap((wh) =>
      wh.locations.map((loc) => ({
        ...loc,
        warehouseName: wh.name,
        label: `${wh.name} / ${loc.name}`,
      }))
    );
  }),
});

