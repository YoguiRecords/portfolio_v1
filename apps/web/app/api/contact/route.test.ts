// @vitest-environment node
import { beforeEach, expect, test } from "vitest";
import { resetRateLimit } from "@portfolio/core";
import { POST } from "./route";

beforeEach(() => resetRateLimit());

function post(body: string, ip = "8.8.8.8"): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body,
  });
}

test("400 sur JSON invalide", async () => {
  expect((await POST(post("nope", "1.1.1.1"))).status).toBe(400);
});

test("honeypot rempli → 200 silencieux", async () => {
  const res = await POST(
    post(JSON.stringify({ name: "Bot", email: "a@b.com", message: "x".repeat(20), website: "spam" }), "2.2.2.2"),
  );
  expect(res.status).toBe(200);
});

test("429 au-delà de la limite (sans toucher la DB)", async () => {
  const ip = "3.3.3.3";
  for (let i = 0; i < 5; i++) expect((await POST(post("bad", ip))).status).toBe(400);
  expect((await POST(post("bad", ip))).status).toBe(429);
});
