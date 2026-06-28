// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { createProfile } from "@portfolio/db/testing/factories";
import { getHomeData } from "./home";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("getHomeData renvoie profil + sections visibles ordonnées", async () => {
  await createProfile(prisma, { fullName: "Yohan Debusscher" });
  await prisma.homeSection.createMany({
    data: [
      { key: "hero", order: 0, isVisible: true },
      { key: "profil", title: "Le profil", order: 1, isVisible: true },
      { key: "hidden", order: 2, isVisible: false },
    ],
  });
  const data = await getHomeData(prisma);
  expect(data.profile?.fullName).toBe("Yohan Debusscher");
  expect(data.sections.map((s) => s.key)).toEqual(["hero", "profil"]);
});
