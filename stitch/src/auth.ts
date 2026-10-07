import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  // VERIFY: @auth/drizzle-adapter requires the tables: accounts, sessions, users, verificationTokens
  // Since we use JWT strategy (no DB sessions), we skip the adapter for now.
  // adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const [user] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            passwordHash: users.passwordHash,
            role: users.role,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        // Fetch warehouse assignments for staff scope enforcement
        const assignments = await db.query.userWarehouseAssignments.findMany({
          where: (t, { eq }) => eq(t.userId, user.id),
          columns: { warehouseId: true },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          warehouseIds: assignments.map((a) => a.warehouseId),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // On sign-in: embed role and warehouseIds into JWT
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.warehouseIds = (user as { warehouseIds?: string[] }).warehouseIds ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "manager" | "staff";
        session.user.warehouseIds = token.warehouseIds as string[];
      }
      return session;
    },
  },
});
