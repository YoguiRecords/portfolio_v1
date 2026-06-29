// @vitest-environment node
import { beforeEach, expect, test } from "vitest";
import { resetRateLimit } from "@portfolio/core";
import { POST } from "./route";

beforeEach(() => resetRateLimit());

function post(body: string, ip = "9.9.9.9"): Request {
  return new Request("http://localhost/api/testimonials", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body,
  });
}

test("400 quand le JSON est invalide", async () => {
  const res = await POST(post("not-json", "1.1.1.1"));
  expect(res.status).toBe(400);
});

test("honeypot rempli → 200 silencieux (rien stocké)", async () => {
  const res = await POST(
    post(JSON.stringify({ authorName: "Bot", content: "x".repeat(20), website: "spam" }), "2.2.2.2"),
  );
  expect(res.status).toBe(200);
});

test("429 au-delà de la limite (sans toucher la DB)", async () => {
  const ip = "3.3.3.3";
  // 3 requêtes invalides (comptées par le rate-limit, rejetées en 400)
  for (let i = 0; i < 3; i++) {
    const res = await POST(post("bad", ip));
    expect(res.status).toBe(400);
  }
  const limited = await POST(post("bad", ip));
  expect(limited.status).toBe(429);
});
