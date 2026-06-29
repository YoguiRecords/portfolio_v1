// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { POST } from "./route";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

function post(body: string): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "5.5.5.5" },
    body,
  });
}

test("chat désactivé par défaut → 404", async () => {
  // Aucune AiAssistantConfig active (isPublicChatEnabled défaut false).
  const res = await POST(post(JSON.stringify({ messages: [{ role: "user", content: "salut" }] })));
  expect(res.status).toBe(404);
});
