import { describe, expect, test } from "vitest";
import { parseAnalysis, ANALYSIS_DEFAULTS, ANALYSIS_TYPES } from "./schemas";

describe("parseAnalysis", () => {
  test("accepts a valid SWOT payload and narrows the type", () => {
    const parsed = parseAnalysis("SWOT", {
      strengths: { label: "Forces", items: ["a", "b"] },
      weaknesses: { label: "Faiblesses", items: [] },
      opportunities: { label: "Opportunités", items: [] },
      threats: { label: "Menaces", items: [] },
    });
    expect(parsed?.type).toBe("SWOT");
    if (parsed?.type === "SWOT") expect(parsed.data.strengths.items).toEqual(["a", "b"]);
  });

  test("accepts a valid 4P payload", () => {
    const parsed = parseAnalysis("FOUR_P", ANALYSIS_DEFAULTS.FOUR_P);
    expect(parsed?.type).toBe("FOUR_P");
  });

  test("accepts Golden Circle and Ikigai payloads", () => {
    expect(parseAnalysis("GOLDEN_CIRCLE", { why: "w", how: "h", what: "t" })?.type).toBe(
      "GOLDEN_CIRCLE",
    );
    expect(
      parseAnalysis("IKIGAI", { love: "", good: "", world: "", paid: "", center: "" })?.type,
    ).toBe("IKIGAI");
  });

  test("returns null for an unknown type", () => {
    expect(parseAnalysis("PESTEL", {})).toBeNull();
  });

  test("returns null for an invalid payload (fail-safe)", () => {
    expect(parseAnalysis("SWOT", { strengths: "oops" })).toBeNull();
  });

  test("every type has a schema-valid default", () => {
    for (const type of ANALYSIS_TYPES) {
      expect(parseAnalysis(type, ANALYSIS_DEFAULTS[type])).not.toBeNull();
    }
  });
});
