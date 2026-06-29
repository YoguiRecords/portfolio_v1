import { prisma } from "@portfolio/db";

/** Back-office overview counters. */
export interface DashboardStats {
  projects: number;
  articles: number;
  pendingTestimonials: number;
  unreadMessages: number;
  pendingAppointments: number;
}

/** Loads the dashboard counters (write-capable `app_admin` role). */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [projects, articles, pendingTestimonials, unreadMessages, pendingAppointments] =
    await Promise.all([
      prisma.project.count(),
      prisma.article.count(),
      prisma.testimonial.count({ where: { status: "PENDING" } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.appointmentRequest.count({ where: { status: "PENDING" } }),
    ]);
  return { projects, articles, pendingTestimonials, unreadMessages, pendingAppointments };
}
