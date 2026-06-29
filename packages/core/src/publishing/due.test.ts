import { expect, test } from "vitest";
import { isDue, splitDue } from "./due";

test("isDue: scheduled in the past is due, future is not", () => {
  const now = new Date("2026-06-28T10:00:00Z");
  expect(
    isDue(
      { status: "SCHEDULED", scheduledAt: new Date("2026-06-28T09:00:00Z") },
      now,
    ),
  ).toBe(true);
  expect(
    isDue(
      { status: "SCHEDULED", scheduledAt: new Date("2026-06-28T11:00:00Z") },
      now,
    ),
  ).toBe(false);
  expect(isDue({ status: "PUBLISHED", scheduledAt: null }, now)).toBe(false);
});

test("splitDue partitions items by due date", () => {
  const now = new Date("2026-06-28T10:00:00Z");
  const items = [
    { id: "a", status: "SCHEDULED", scheduledAt: new Date("2026-06-28T09:00:00Z") },
    { id: "b", status: "SCHEDULED", scheduledAt: new Date("2026-06-28T12:00:00Z") },
  ] as const;
  const { due, pending } = splitDue([...items], now);
  expect(due.map((i) => i.id)).toEqual(["a"]);
  expect(pending.map((i) => i.id)).toEqual(["b"]);
});
