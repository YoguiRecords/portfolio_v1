import { requirePermission } from "@/lib/auth/guards";
import Link from "next/link";
import { prisma } from "@portfolio/db";
import { PageContainer } from "@/components/ui";
import { getCalendar, isGraphLive } from "@/lib/integrations/factory";
import { listUnavailabilities } from "@/lib/booking/unavailability";
import type { CalendarEvent } from "@portfolio/core/integrations";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const KIND_COLOR: Record<CalendarEvent["kind"], string> = {
  event: "bg-accent/20 text-accent",
  appointment: "bg-ok/20 text-ok",
  external: "bg-info/20 text-info",
};

/** Parses `?m=YYYY-MM` into a [year, monthIndex], defaulting to the current month. */
function resolveMonth(m: string | undefined): { year: number; month: number } {
  const match = m?.match(/^(\d{4})-(\d{2})$/);
  if (match) return { year: Number(match[1]), month: Number(match[2]) - 1 };
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

/** Local `YYYY-MM-DD` key for bucketing events by day. */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shiftMonth(year: number, month: number, delta: number): string {
  const d = new Date(year, month + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** BO calendar: month grid of agenda events + confirmed RDV (+ Outlook when connected). */
export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  await requirePermission("calendar");
  const { m } = await searchParams;
  const { year, month } = resolveMonth(m);

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
  const [events, unavailabilities] = await Promise.all([
    getCalendar().listEvents(monthStart.toISOString(), monthEnd.toISOString()),
    listUnavailabilities(prisma, monthStart),
  ]);

  /** True if `date`'s day overlaps any declared unavailability. */
  const isOff = (date: Date): boolean => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    return unavailabilities.some((u) => u.startAt <= dayEnd && u.endAt >= dayStart);
  };

  // Bucket events per local day.
  const byDay = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const key = dayKey(new Date(e.start));
    (byDay.get(key) ?? byDay.set(key, []).get(key)!).push(e);
  }

  // Build the grid (Monday-first), padded to full weeks.
  const firstWeekday = (monthStart.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = monthEnd.getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = monthStart.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <PageContainer width="full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize text-ink">{monthLabel}</h1>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isGraphLive() ? "bg-ok/15 text-ok" : "bg-warn/15 text-warn"
            }`}
          >
            {isGraphLive() ? "Outlook + site" : "Site (agenda + RDV)"}
          </span>
          <Link href={`/calendrier?m=${shiftMonth(year, month, -1)}`} className="rounded-control border border-border px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-2">
            ←
          </Link>
          <Link href="/calendrier" className="rounded-control border border-border px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-2">
            Aujourd’hui
          </Link>
          <Link href={`/calendrier?m=${shiftMonth(year, month, 1)}`} className="rounded-control border border-border px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-2">
            →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-card border border-border bg-border">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-bg p-2 text-center text-xs font-medium text-muted">
            {w}
          </div>
        ))}
        {cells.map((date, i) => (
          <div key={i} className="min-h-24 bg-bg p-1.5">
            {date ? (
              <>
                <div className="mb-1 text-xs text-muted">{date.getDate()}</div>
                <div className="flex flex-col gap-1">
                  {isOff(date) ? (
                    <div className="truncate rounded bg-muted/20 px-1.5 py-0.5 text-[11px] text-muted">
                      Indisponible
                    </div>
                  ) : null}
                  {(byDay.get(dayKey(date)) ?? []).map((e) => (
                    <div
                      key={e.id}
                      title={`${e.title}${e.location ? ` · ${e.location}` : ""}`}
                      className={`truncate rounded px-1.5 py-0.5 text-[11px] ${KIND_COLOR[e.kind]}`}
                    >
                      {new Date(e.start).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} {e.title}
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted">
        <span className="text-accent">●</span> Évènement agenda ·{" "}
        <span className="text-ok">●</span> RDV confirmé ·{" "}
        <span className="text-info">●</span> Outlook ·{" "}
        <span className="text-muted">▨</span> Indisponible (congés)
      </p>
    </PageContainer>
  );
}
