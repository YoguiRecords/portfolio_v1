import { vi } from "vitest";

const db = vi.hoisted(() => ({
  contactCount: vi.fn(),
  dealCount: vi.fn(),
  dealGroupBy: vi.fn(),
  taskCount: vi.fn(),
  taskFindMany: vi.fn(),
  messageCount: vi.fn(),
  messageFindMany: vi.fn(),
  testimonialCount: vi.fn(),
  appointmentCount: vi.fn(),
  articleCount: vi.fn(),
}));

vi.mock("@portfolio/db", () => ({
  prisma: {
    contact: { count: db.contactCount },
    deal: { count: db.dealCount, groupBy: db.dealGroupBy },
    task: { count: db.taskCount, findMany: db.taskFindMany },
    contactMessage: { count: db.messageCount, findMany: db.messageFindMany },
    testimonial: { count: db.testimonialCount },
    appointmentRequest: { count: db.appointmentCount },
    article: { count: db.articleCount },
  },
}));

vi.mock("@/lib/integrations/factory", () => ({ getMailbox: () => ({ listMessages: async () => [] }) }));
vi.mock("@/lib/inbox/aggregate", () => ({ aggregateInbox: async () => [] }));

import { beforeEach, expect, test } from "vitest";
import { getMissionControlData } from "./mission-control";

beforeEach(() => {
  db.contactCount.mockResolvedValue(12);
  db.dealCount.mockResolvedValue(4);
  db.dealGroupBy.mockResolvedValue([{ stage: "PROSPECT", _count: { _all: 3 }, _sum: { valueCents: 150000 } }]);
  db.taskCount.mockResolvedValue(2);
  db.taskFindMany.mockResolvedValue([{ id: "t1", title: "Relancer", dueAt: new Date("2026-07-01") }]);
  db.messageCount.mockResolvedValue(5);
  db.messageFindMany.mockResolvedValue([]);
  db.testimonialCount.mockResolvedValue(1);
  db.appointmentCount.mockResolvedValue(0);
  db.articleCount.mockResolvedValue(3);
});

test("agrège KPIs, pipeline et à-traiter", async () => {
  const data = await getMissionControlData();
  expect(data.kpis).toEqual({ contacts: 12, openDeals: 4, unread: 5, pendingTasks: 2 });
  expect(data.pipeline).toEqual([{ stage: "PROSPECT", count: 3, valueCents: 150000 }]);
  expect(data.toTreat).toEqual({ pendingTestimonials: 1, pendingAppointments: 0, draftArticles: 3 });
  expect(data.tasks[0]).toMatchObject({ id: "t1", title: "Relancer" });
});

test("tasks : ne renvoie que les tâches du jour (dueAt = aujourd'hui), status != DONE", async () => {
  await getMissionControlData();
  const arg = db.taskFindMany.mock.calls[0][0];
  expect(arg.where.status).toEqual({ not: "DONE" });
  expect(arg.where.dueAt).toHaveProperty("gte");
  expect(arg.where.dueAt).toHaveProperty("lt");
});
