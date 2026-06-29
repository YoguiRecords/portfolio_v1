import { expect, test } from "vitest";
import { localize } from "./localize";
import { translateFields } from "./translate";
import { frChanged } from "./changed";
import { hashSource } from "./hash";
import { mockLlm } from "../testing/mock-llm";

const tr = [{ field: "title", locale: "en", value: "The profile" }];

test("localize: EN superpose le champ traduit", () => {
  expect(localize({ id: "1", title: "Le profil" }, tr, "en", ["title"]).title).toBe("The profile");
});
test("localize: fallback FR si pas de trad", () => {
  expect(localize({ id: "1", title: "Le profil" }, [], "en", ["title"]).title).toBe("Le profil");
});
test("localize: FR (défaut) ignore l'overlay", () => {
  expect(localize({ id: "1", title: "Le profil" }, tr, "fr", ["title"]).title).toBe("Le profil");
});

test("translateFields: une trad par champ + hash source (sha-256)", async () => {
  const llm = mockLlm(["The profile"]);
  const out = await translateFields(llm, { title: "Le profil" }, "en");
  expect(out[0]).toMatchObject({ field: "title", locale: "en", value: "The profile", isAuto: true });
  expect(out[0].sourceHash).toHaveLength(64);
});

test("frChanged: vrai si FR modifié ou pas de trad, faux si identique", () => {
  const fr = "Le profil";
  const translation = { sourceHash: hashSource(fr) };
  expect(frChanged(fr, translation)).toBe(false);
  expect(frChanged("Le profil modifié", translation)).toBe(true);
  expect(frChanged(fr, null)).toBe(true);
});
