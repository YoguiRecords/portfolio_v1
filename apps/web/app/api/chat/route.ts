import { prisma } from "@portfolio/db";
import { allow, assertBudget, buildContext, estimateTokens, recordUsage, clientIpFromHeaders } from "@portfolio/core";
import { runChat, type ChatTurn } from "../../../lib/chat/run";
import { buildChatLlm } from "../../../lib/chat/llm";

const RATE = { max: 12, windowMs: 10 * 60 * 1000 }; // 12 / 10 min / IP

/** Validates the chat history payload. */
function parseHistory(body: unknown): ChatTurn[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) {
    return null;
  }
  const raw = (body as { messages: unknown[] }).messages;
  const turns: ChatTurn[] = [];
  for (const m of raw.slice(-12)) {
    if (m && typeof m === "object" && "role" in m && "content" in m) {
      const role = (m as { role: unknown }).role;
      const content = (m as { content: unknown }).content;
      if ((role === "user" || role === "assistant") && typeof content === "string") {
        turns.push({ role, content: content.slice(0, 2000) });
      }
    }
  }
  return turns.length ? turns : null;
}

/**
 * Public chatbot endpoint. Disabled by default (`AiAssistantConfig
 * .isPublicChatEnabled` + the OpenRouter key). When enabled: rate-limit → build
 * the guardrail prompt from PUBLIC data only → call the LLM. Server-only.
 */
export async function POST(request: Request): Promise<Response> {
  const config = await prisma.aiAssistantConfig.findFirst();
  if (!config?.isPublicChatEnabled) {
    return Response.json({ error: "disabled" }, { status: 404 });
  }

  const ip = clientIpFromHeaders(request.headers);
  if (!allow(`chat:${ip}`, RATE)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const history = parseHistory(body);
  if (!history) return Response.json({ error: "invalid" }, { status: 400 });

  // Monthly token budget guard (cost / abuse control, on top of the rate-limit).
  const estimatedIn = estimateTokens(history.map((t) => t.content).join(" "));
  try {
    assertBudget(config, estimatedIn);
  } catch {
    return Response.json({ error: "budget_exceeded" }, { status: 429 });
  }

  const llm = await buildChatLlm();
  if (!llm) return Response.json({ error: "disabled" }, { status: 404 });

  const [profile, projects, skills, articles, events] = await Promise.all([
    prisma.profile.findFirst({ select: { fullName: true, headline: true, aiSummary: true } }),
    prisma.project.findMany({ where: { status: "PUBLISHED" }, select: { title: true, summary: true } }),
    prisma.skill.findMany({ select: { name: true } }),
    prisma.article.findMany({ where: { status: "PUBLISHED" }, select: { title: true } }),
    prisma.event.findMany({
      where: { status: "PUBLISHED", visibility: "PUBLIC", startAt: { gte: new Date() } },
      orderBy: { startAt: "asc" },
      take: 5,
      select: { title: true, startAt: true },
    }),
  ]);

  const context = buildContext({ profile, projects, skills, articles, events });
  let result;
  try {
    result = await runChat(llm, {
      context,
      persona: config.systemPersona,
      name: config.assistantName,
      history,
    });
  } catch {
    // Provider/model error (bad slug, outage, timeout…): fail gracefully so the
    // widget shows a friendly message instead of a raw 500.
    return Response.json({ error: "unavailable" }, { status: 502 });
  }

  // Record token usage (best-effort; the provider result carries no usage count,
  // so we estimate from the exchanged text). Raw UPDATE of the single counter
  // column: `app_web` is granted UPDATE only on `tokensUsedThisMonth`, and this
  // avoids Prisma's automatic `updatedAt` write (ungranted) + the RETURNING.
  const used = recordUsage(config, estimatedIn + estimateTokens(result.content));
  await prisma
    .$executeRaw`UPDATE "AiAssistantConfig" SET "tokensUsedThisMonth" = ${used.tokensUsedThisMonth} WHERE "id" = ${config.id}`
    .catch(() => undefined);

  return Response.json({ reply: result.content });
}
