import { expect, test } from "vitest";
import { ProcessBlock, GameDesignBlock, parseBlock } from "./schemas";

test("ProcessBlock valide des phases", () => {
  const r = ProcessBlock.safeParse({ phases: [{ label: "Cadrage", start: 0, width: 14 }] });
  expect(r.success).toBe(true);
});

test("ProcessBlock rejette une largeur hors bornes", () => {
  expect(
    ProcessBlock.safeParse({ phases: [{ label: "x", start: 0, width: 999 }] }).success,
  ).toBe(false);
});

test("GameDesignBlock exige piliers, coreLoop et mécaniques", () => {
  expect(
    GameDesignBlock.safeParse({
      pillars: [{ name: "Tension", desc: "..." }],
      coreLoop: ["Action"],
      mechanics: ["M1"],
    }).success,
  ).toBe(true);
  expect(GameDesignBlock.safeParse({ pillars: [], coreLoop: [], mechanics: [] }).success).toBe(
    false,
  );
});

test("parseBlock renvoie le bloc typé ou null (type inconnu / data invalide)", () => {
  const ok = parseBlock("CONTEXT", { problem: "p", objective: "o", role: "r" });
  expect(ok?.type).toBe("CONTEXT");
  expect(parseBlock("UNKNOWN", {})).toBeNull();
  expect(parseBlock("CONTEXT", { problem: "p" })).toBeNull();
});
