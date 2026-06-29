import { expect, test } from "vitest";
import { personJsonLd, faqPageJsonLd, creativeWorkJsonLd } from "./jsonld";
import { buildMetadata } from "./metadata";

test("personJsonLd produit un Person avec name/jobTitle/sameAs", () => {
  const ld = personJsonLd({
    name: "Yohan Debusscher",
    jobTitle: "Concepteur-développeur",
    url: "https://x.com",
    sameAs: ["https://github.com/y"],
  });
  expect(ld["@type"]).toBe("Person");
  expect(ld.name).toBe("Yohan Debusscher");
  expect(ld.sameAs).toEqual(["https://github.com/y"]);
});

test("faqPageJsonLd mappe questions/réponses", () => {
  const ld = faqPageJsonLd([{ question: "Q ?", answer: "R." }]);
  expect(ld["@type"]).toBe("FAQPage");
  expect(ld.mainEntity[0].acceptedAnswer.text).toBe("R.");
});

test("creativeWorkJsonLd porte l'auteur", () => {
  const ld = creativeWorkJsonLd({ name: "P", description: "d", url: "u", author: "Yohan" });
  expect(ld["@type"]).toBe("CreativeWork");
  expect(ld.author.name).toBe("Yohan");
});

test("buildMetadata: défauts settings + hreflang fr/en", () => {
  const meta = buildMetadata({
    settings: { defaultSeoTitle: "Titre défaut", defaultSeoDescription: "Desc défaut" },
    locale: "fr",
    path: "/",
  });
  expect(meta.title).toBe("Titre défaut");
  expect(meta.description).toBe("Desc défaut");
  expect(meta.alternates?.languages).toMatchObject({
    fr: expect.stringContaining("/") as unknown as string,
    en: expect.stringContaining("/en") as unknown as string,
  });
});

test("buildMetadata: un title explicite remplace le défaut", () => {
  const meta = buildMetadata({
    title: "Mon titre",
    settings: { defaultSeoTitle: "Défaut" },
    locale: "en",
    path: "/projets/x",
  });
  expect(meta.title).toBe("Mon titre");
});
