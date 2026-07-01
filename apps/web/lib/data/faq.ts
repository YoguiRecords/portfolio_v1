import { cache } from "react";
import { prisma as sharedPrisma, type PrismaClient } from "@portfolio/db";
import { overlayMany } from "./overlay";

/** A FaqEntry scope (mirrors the Prisma enum). */
export type FaqScope = "GLOBAL" | "HOME" | "PROJECT" | "ARTICLE";

/**
 * Lists **visible** FAQ entries of one scope, ordered, with the EN overlay
 * applied to `question` / `answer` (fallback FR). Only display columns are read,
 * matching the least-privilege `app_web` grant.
 *
 * @param prisma - Prisma client (injected for tests).
 * @param scope - the FAQ scope to list (GLOBAL by default).
 * @param locale - active locale.
 */
export async function listFaq(prisma: PrismaClient, scope: FaqScope = "GLOBAL", locale = "fr") {
  const rows = await prisma.faqEntry.findMany({
    where: { scope, isVisible: true },
    orderBy: { order: "asc" },
    select: { id: true, question: true, answer: true },
  });
  return overlayMany(prisma, locale, "FaqEntry", rows, ["question", "answer"]);
}

export type FaqItem = Awaited<ReturnType<typeof listFaq>>[number];

/** Request-cached loader for GLOBAL FAQ (used by the `/faq` page). */
export const getGlobalFaq = cache((locale = "fr") => listFaq(sharedPrisma, "GLOBAL", locale));
