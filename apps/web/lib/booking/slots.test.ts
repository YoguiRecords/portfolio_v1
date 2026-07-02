import { expect, test } from "vitest";
import { groupSlotsByDay } from "./slots";

test("groupSlotsByDay: regroupe par jour Europe/Paris en conservant l'ordre", () => {
  // Arrange — 22:30 UTC le 6 = déjà le 7 juillet à Paris (UTC+2 en été).
  const slots = [
    "2026-07-06T07:00:00.000Z",
    "2026-07-06T08:00:00.000Z",
    "2026-07-06T22:30:00.000Z",
    "2026-07-07T09:00:00.000Z",
  ];

  // Act
  const groups = groupSlotsByDay(slots, "fr");

  // Assert
  expect(groups).toHaveLength(2);
  expect(groups[0]?.slots.map((s) => s.iso)).toEqual(slots.slice(0, 2));
  expect(groups[1]?.slots.map((s) => s.iso)).toEqual(slots.slice(2));
  expect(groups[0]?.dayLabel).toMatch(/lundi 6 juillet/i);
  expect(groups[0]?.slots[0]?.timeLabel).toBe("09:00");
});

test("groupSlotsByDay: libellés anglais pour la locale en", () => {
  // Arrange
  const groups = groupSlotsByDay(["2026-07-06T07:00:00.000Z"], "en");

  // Assert
  expect(groups[0]?.dayLabel).toMatch(/Monday 6 July/i);
});

test("groupSlotsByDay: liste vide → aucun groupe", () => {
  expect(groupSlotsByDay([], "fr")).toEqual([]);
});
