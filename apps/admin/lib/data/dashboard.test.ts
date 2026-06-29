import { vi } from "vitest";

const db = vi.hoisted(() => ({
  projectCount: vi.fn(),
  articleCount: vi.fn(),
  testimonialCount: vi.fn(),
  projectFindMany: vi.fn(),
  articleFindMany: vi.fn(),
  getTrafficSummary: vi.fn(),
}));

vi.mock("@portfolio/db", () => ({
  prisma: {
    project: { count: db.projectCount, findMany: db.projectFindMany },
    article: { count: db.articleCount, findMany: db.articleFindMany },
    testimonial: { count: db.testimonialCount },
  },
}));

vi.mock("./traffic", () => ({ getTrafficSummary: db.getTrafficSummary }));

import { beforeEach, expect, test } from "vitest";
import { getDashboardData } from "./dashboard";

beforeEach(() => {
  db.projectCount.mockImplementation((args?: { where?: { status?: string } }) =>
    Promise.resolve(args?.where?.status === "DRAFT" ? 2 : 7),
  );
  db.articleCount.mockImplementation((args?: { where?: { status?: string } }) => {
    if (args?.where?.status === "DRAFT") return Promise.resolve(3);
    if (args?.where?.status === "SCHEDULED") return Promise.resolve(1);
    return Promise.resolve(10);
  });
  db.testimonialCount.mockResolvedValue(4);
  db.projectFindMany.mockResolvedValue([
    { id: "p1", title: "Projet ancien", publishedAt: new Date("2026-01-01") },
  ]);
  db.articleFindMany.mockResolvedValue([
    { id: "a1", title: "Article récent", publishedAt: new Date("2026-06-01") },
  ]);
  db.getTrafficSummary.mockResolvedValue({ configured: false, visitors: null, pageviews: null, deltaPct: null });
});

test("agrège KPIs et contenu à traiter", async () => {
  const data = await getDashboardData();
  expect(data.kpis).toEqual({ projects: 7, articles: 10, pendingTestimonials: 4 });
  expect(data.contentToTreat).toEqual({
    draftProjects: 2,
    draftArticles: 3,
    scheduledArticles: 1,
    pendingTestimonials: 4,
  });
});

test("fusionne et trie les top contenus par date de publication décroissante", async () => {
  const data = await getDashboardData();
  expect(data.topContent).toHaveLength(2);
  expect(data.topContent[0]).toMatchObject({ id: "a1", kind: "article" });
  expect(data.topContent[1]).toMatchObject({ id: "p1", kind: "project" });
});
