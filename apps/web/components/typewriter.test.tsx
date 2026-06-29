import { expect, test } from "vitest";
import { sliceTyped } from "./typewriter";

test("sliceTyped renvoie la partie visible et le reste", () => {
  expect(sliceTyped("Je conçois", 3)).toEqual({ typed: "Je ", ghost: "conçois" });
});

test("sliceTyped à 0 ne montre rien et garde tout en ghost", () => {
  expect(sliceTyped("Yohan", 0)).toEqual({ typed: "", ghost: "Yohan" });
});
