import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function createAccounts() {
  console.log("🚀 Creating 4 Staff and 2 Manager accounts...");
  
  const passwordHash = await bcrypt.hash("password123", 12);

  const newUsers = [
    // Managers
    { name: "Manager One", email: "manager1@coreinventory.com", passwordHash, role: "manager" },
    { name: "Manager Two", email: "manager2@coreinventory.com", passwordHash, role: "manager" },
    // Staff
    { name: "Staff One", email: "staff1@coreinventory.com", passwordHash, role: "staff" },
    { name: "Staff Two", email: "staff2@coreinventory.com", passwordHash, role: "staff" },
    { name: "Staff Three", email: "staff3@coreinventory.com", passwordHash, role: "staff" },
    { name: "Staff Four", email: "staff4@coreinventory.com", passwordHash, role: "staff" },
  ] as const;

  try {
    for (const user of newUsers) {
      console.log(`Creating ${user.role}: ${user.email}...`);
      await db.insert(users).values(user);
    }
    console.log("✅ All accounts created successfully.");
    console.log("\nCREDENTIALS LIST:");
    console.log("----------------------------");
    console.log("Common Password: password123");
    console.log("----------------------------");
    newUsers.forEach(u => console.log(`${u.role.toUpperCase()}: ${u.email}`));
  } catch (error) {
    console.error("❌ Error creating accounts:", error);
  }
}

createAccounts();
