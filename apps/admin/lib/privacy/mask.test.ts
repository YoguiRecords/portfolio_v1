import { expect, test } from "vitest";
import { maskEmail, maskPii } from "./mask";

test("maskEmail masque le local et le domaine", () => {
  expect(maskEmail("john.doe@example.com")).toBe("j•••@•••.com");
});

test("maskPii masque pour VIEWER et laisse intact pour OWNER", () => {
  expect(maskPii("john@example.com", { role: "VIEWER" })).toBe("j•••@•••.com");
  expect(maskPii("john@example.com", { role: "OWNER" })).toBe("john@example.com");
  expect(maskPii("1.2.3.4", { role: "VIEWER" })).toBe("•••");
});
