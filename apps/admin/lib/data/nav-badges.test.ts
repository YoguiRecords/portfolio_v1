import { vi } from "vitest";

const count = vi.hoisted(() => ({
  testimonial: vi.fn(),
  contactMessage: vi.fn(),
  appointmentRequest: vi.fn(),
}));

vi.mock("@portfolio/db", () => ({
  prisma: {
    testimonial: { count: count.testimonial },
    contactMessage: { count: count.contactMessage },
    appointmentRequest: { count: count.appointmentRequest },
  },
}));

import { beforeEach, expect, test } from "vitest";
import { getNavBadges } from "./nav-badges";

beforeEach(() => {
  count.testimonial.mockResolvedValue(3);
  count.contactMessage.mockResolvedValue(5);
  count.appointmentRequest.mockResolvedValue(1);
});

test("agrège les compteurs de navigation", async () => {
  const badges = await getNavBadges();
  expect(badges).toEqual({ pendingTestimonials: 3, unreadMessages: 5, pendingAppointments: 1 });
});

test("ne compte que les témoignages PENDING et les messages non lus", async () => {
  await getNavBadges();
  expect(count.testimonial).toHaveBeenCalledWith({ where: { status: "PENDING" } });
  expect(count.contactMessage).toHaveBeenCalledWith({ where: { isRead: false } });
  expect(count.appointmentRequest).toHaveBeenCalledWith({ where: { status: "PENDING" } });
});
