import { prisma } from "@portfolio/db";
import { getMailbox } from "@/lib/integrations/factory";
import { aggregateInbox, type InboxItem } from "@/lib/inbox/aggregate";

/** KPIs « relation client » en tête de Mission Control. */
export interface MissionKpis {
  contacts: number;
  openDeals: number;
  unread: number;
  pendingTasks: number;
}

/** Résumé d'une colonne de pipeline. */
export interface PipelineSummaryItem {
  stage: string;
  count: number;
  valueCents: number;
}

/** Tâche/relance à traiter. */
export interface MissionTask {
  id: string;
  title: string;
  dueAtLabel: string | null;
}

/** « À traiter » transverse (modération / publishing / RDV). */
export interface MissionToTreat {
  pendingTestimonials: number;
  pendingAppointments: number;
  draftArticles: number;
}

/** Données agrégées de Mission Control (pilotage de la relation client + à-faire). */
export interface MissionControlData {
  kpis: MissionKpis;
  pipeline: PipelineSummaryItem[];
  tasks: MissionTask[];
  toTreat: MissionToTreat;
  inboxPreview: InboxItem[];
}

const CLOSED_STAGES: ("WON" | "LOST")[] = ["WON", "LOST"];

/**
 * Agrège tout ce que l'admin doit piloter : KPIs relation client, pipeline,
 * tâches/relances du moment, file « à traiter » et aperçu de la boîte de réception.
 * Distinct du Dashboard (portfolio/audience).
 */
export async function getMissionControlData(): Promise<MissionControlData> {
  const [contacts, openDeals, unread, pendingTasks, grouped, tasks, pendingTestimonials, pendingAppointments, draftArticles, inboxPreview] =
    await Promise.all([
      prisma.contact.count(),
      prisma.deal.count({ where: { stage: { notIn: CLOSED_STAGES } } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.crmTask.count({ where: { isDone: false } }),
      prisma.deal.groupBy({ by: ["stage"], _count: { _all: true }, _sum: { valueCents: true } }),
      prisma.crmTask.findMany({ where: { isDone: false }, orderBy: { dueAt: "asc" }, take: 8 }),
      prisma.testimonial.count({ where: { status: "PENDING" } }),
      prisma.appointmentRequest.count({ where: { status: "PENDING" } }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      aggregateInbox(
        {
          mailbox: getMailbox(),
          listContactMessages: () =>
            prisma.contactMessage.findMany({ where: { isSpam: false }, orderBy: { createdAt: "desc" } }),
        },
        "ALL",
      ),
    ]);

  return {
    kpis: { contacts, openDeals, unread, pendingTasks },
    pipeline: grouped.map((g) => ({
      stage: g.stage,
      count: g._count._all,
      valueCents: g._sum.valueCents ?? 0,
    })),
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      dueAtLabel: t.dueAt ? t.dueAt.toLocaleDateString("fr-FR") : null,
    })),
    toTreat: { pendingTestimonials, pendingAppointments, draftArticles },
    inboxPreview: inboxPreview.slice(0, 5),
  };
}
