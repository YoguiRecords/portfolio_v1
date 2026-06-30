import { prisma } from "@portfolio/db";
import { listAppointments } from "@/lib/content/moderation";
import { confirmAppointmentAction, declineAppointmentAction } from "@/lib/actions/moderation-actions";
import { PageContainer } from "@/components/ui";
import { RdvList, type RdvRow } from "@/components/rdv/rdv-list";

export const dynamic = "force-dynamic";

/** Appointment requests v2: accept (→ calendar event) / decline, distinct from inbox. */
export default async function AppointmentsPage() {
  const requests = await listAppointments(prisma);
  const rows: RdvRow[] = requests.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    topic: r.topic,
    message: r.message,
    status: r.status,
    requestedAtLabel: r.requestedAt
      ? r.requestedAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
      : null,
  }));

  return (
    <PageContainer width="full">
      <h1 className="text-2xl font-bold text-ink">Demandes de rendez-vous</h1>
      <RdvList requests={rows} actions={{ confirm: confirmAppointmentAction, decline: declineAppointmentAction }} />
    </PageContainer>
  );
}
