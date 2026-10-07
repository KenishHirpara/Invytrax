import { db } from "@/db";
import { otpTokens, users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);

/**
 * Generates a secure 6-digit OTP and stores it in the DB.
 * Old/expired tokens for the same user are invalidated before inserting.
 * @returns The plain-text OTP to send via email
 */
export async function generateOtp(userId: string): Promise<string> {
  // Invalidate any existing unused OTPs for this user
  await db
    .update(otpTokens)
    .set({ used: true })
    .where(and(eq(otpTokens.userId, userId), eq(otpTokens.used, false)));

  // Generate a cryptographically secure 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(otpTokens).values({
    userId,
    token: otp,
    expiresAt,
    used: false,
  });

  return otp;
}

/**
 * Validates an OTP token for a given email address.
 * Marks the token as used upon success.
 * @returns userId if valid, null if invalid or expired
 */
export async function validateOtp(
  email: string,
  token: string
): Promise<string | null> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return null;

  const now = new Date();

  const [otpRecord] = await db
    .select()
    .from(otpTokens)
    .where(
      and(
        eq(otpTokens.userId, user.id),
        eq(otpTokens.token, token),
        eq(otpTokens.used, false),
        gt(otpTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!otpRecord) return null;

  // Mark as used — single-use enforcement
  await db
    .update(otpTokens)
    .set({ used: true })
    .where(eq(otpTokens.id, otpRecord.id));

  return user.id;
}
