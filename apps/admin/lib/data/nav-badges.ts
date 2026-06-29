import { prisma } from "@portfolio/db";
import type { NavBadges } from "@/components/admin-nav/admin-nav";

/**
 * Charge les compteurs affichés en pastille dans la navigation (rôle `app_admin`) :
 * témoignages à valider, messages non lus, demandes de RDV en attente.
 */
export async function getNavBadges(): Promise<NavBadges> {
  const [pendingTestimonials, unreadMessages, pendingAppointments] = await Promise.all([
    prisma.testimonial.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.appointmentRequest.count({ where: { status: "PENDING" } }),
  ]);
  return { pendingTestimonials, unreadMessages, pendingAppointments };
}
