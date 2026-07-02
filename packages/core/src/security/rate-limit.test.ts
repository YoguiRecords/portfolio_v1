import { beforeEach, expect, test } from "vitest";
import { allow, rateLimitSize, resetRateLimit } from "./rate-limit";

beforeEach(() => resetRateLimit());

test("autorise jusqu'à la limite puis bloque", () => {
  const opts = { max: 3, windowMs: 60_000 };
  expect(allow("ip", opts, 1000)).toBe(true);
  expect(allow("ip", opts, 1001)).toBe(true);
  expect(allow("ip", opts, 1002)).toBe(true);
  expect(allow("ip", opts, 1003)).toBe(false);
});

test("réautorise après expiration de la fenêtre", () => {
  const opts = { max: 1, windowMs: 1000 };
  expect(allow("ip", opts, 0)).toBe(true);
  expect(allow("ip", opts, 500)).toBe(false);
  expect(allow("ip", opts, 1500)).toBe(true);
});

test("balayage anti-fuite : les buckets expirés sont purgés au-delà du seuil", () => {
  // Arrange — dépasse le seuil de balayage avec des buckets qui expirent à t=10.
  const opts = { max: 1, windowMs: 10 };
  for (let i = 0; i < 10_001; i++) {
    allow(`ip-${i}`, opts, 0);
  }

  // Act — un hit après expiration déclenche le balayage global.
  allow("fresh", opts, 1_000);

  // Assert — seuls le bucket frais survit.
  expect(rateLimitSize()).toBe(1);
});
