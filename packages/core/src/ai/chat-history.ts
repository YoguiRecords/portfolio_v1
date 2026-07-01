import { z } from "zod";

/** One public chat turn (post-validation). */
export interface ChatHistoryTurn {
  role: "user" | "assistant";
  content: string;
}

/** How many trailing turns are kept from the submitted history. */
const MAX_TURNS = 12;
/** Per-turn content cap (defence against oversized payloads). */
const MAX_CONTENT_CHARS = 2000;

const TurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const BodySchema = z.object({ messages: z.array(z.unknown()) });

/**
 * Validates the public chatbot payload. Tolerant on purpose: malformed turns
 * are dropped (not a 400) so a slightly corrupted client history still chats;
 * content is truncated and only the last {@link MAX_TURNS} turns are kept.
 *
 * @returns The sanitized history, or `null` when nothing usable remains.
 */
export function parseChatHistory(body: unknown): ChatHistoryTurn[] | null {
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return null;

  const turns = parsed.data.messages.slice(-MAX_TURNS).flatMap((message): ChatHistoryTurn[] => {
    const turn = TurnSchema.safeParse(message);
    if (!turn.success) return [];
    return [{ role: turn.data.role, content: turn.data.content.slice(0, MAX_CONTENT_CHARS) }];
  });

  return turns.length ? turns : null;
}
