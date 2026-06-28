/**
 * Database seed — provisions the single back office admin account.
 *
 * Idempotent: re-running updates the existing account's password rather than
 * creating duplicates. Credentials come from the environment (never hard-coded):
 *   - `ADMIN_EMAIL`    — admin login email
 *   - `ADMIN_PASSWORD` — initial admin password (hashed with argon2id at rest)
 *
 * TOTP (MFA) is left disabled here; enrolment happens in the back office.
 *
 * Run with: `pnpm --filter @portfolio/db db:seed`
 */
import { hashPassword } from "@portfolio/core";
import { prisma } from "../src/index";

/**
 * Reads a required environment variable or fails fast with a clear message.
 *
 * @param name - The environment variable name.
 * @returns The variable's value.
 * @throws If the variable is missing or empty.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main(): Promise<void> {
  const email = requireEnv("ADMIN_EMAIL").toLowerCase();
  const passwordHash = await hashPassword(requireEnv("ADMIN_PASSWORD"));

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  // Never log the password or its hash.
  console.log(`Admin account ready: ${admin.email} (id=${admin.id})`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
