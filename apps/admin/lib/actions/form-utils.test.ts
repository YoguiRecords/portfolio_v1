import { expect, test } from "vitest";
import { csv, lines, reqId, str } from "./form-utils";

function form(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

test("str: valeur présente → chaîne ; vide/blanc/absent → undefined", () => {
  // Arrange
  const data = form({ a: "x", b: "  " });

  // Act & Assert
  expect(str(data, "a")).toBe("x");
  expect(str(data, "b")).toBeUndefined();
  expect(str(data, "missing")).toBeUndefined();
});

test("reqId: lit le champ id", () => {
  expect(reqId(form({ id: "abc" }))).toBe("abc");
  expect(reqId(form({}))).toBeUndefined();
});

test("csv: découpe sur la virgule, trim, ignore les vides", () => {
  expect(csv(form({ tags: " a, b ,,c " }), "tags")).toEqual(["a", "b", "c"]);
  expect(csv(form({}), "tags")).toEqual([]);
});

test("lines: une entrée par ligne non vide", () => {
  expect(lines(form({ items: " un \n\n deux " }), "items")).toEqual(["un", "deux"]);
  expect(lines(form({}), "items")).toEqual([]);
});
