import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "manager" | "staff";
      warehouseIds: string[];
    } & DefaultSession["user"];
  }

  interface User {
    role: "manager" | "staff";
    warehouseIds: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "manager" | "staff";
    warehouseIds: string[];
  }
}
