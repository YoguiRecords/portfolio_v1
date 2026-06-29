import Link from "next/link";
import { getCalendar, isGraphLive } from "@/lib/integrations/factory";
import type { CalendarEvent } from "@portfolio/core/integrations";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const KIND_COLOR: Record<CalendarEvent["kind"], string> = {
  event: "bg-amber-500/20 text-amber-200",
  appointment: "bg-emerald-500/20 text-emerald-200",
  external: "bg-sky-500/20 text-sky-200",
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
  const { m } = await searchParams;
  const { year, month } = resolveMonth(m);

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
  const events = await getCalendar().listEvents(monthStart.toISOString(), monthEnd.toISOString());

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
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold capitalize text-zinc-50">{monthLabel}</h1>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isGraphLive() ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
            }`}
          >
            {isGraphLive() ? "Outlook + site" : "Site (agenda + RDV)"}
          </span>
          <Link href={`/calendrier?m=${shiftMonth(year, month, -1)}`} className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
            ←
          </Link>
          <Link href="/calendrier" className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
            Aujourd&apos;hui
          </Link>
          <Link href={`/calendrier?m=${shiftMonth(year, month, 1)}`} className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
            →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-zinc-950 p-2 text-center text-xs font-medium text-zinc-500">
            {w}
          </div>
        ))}
        {cells.map((date, i) => (
          <div key={i} className="min-h-24 bg-zinc-950 p-1.5">
            {date ? (
              <>
                <div className="mb-1 text-xs text-zinc-500">{date.getDate()}</div>
                <div className="flex flex-col gap-1">
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

      <p className="text-xs text-zinc-500">
        <span className="text-amber-300">●</span> Évènement agenda ·{" "}
        <span className="text-emerald-300">●</span> RDV confirmé ·{" "}
        <span className="text-sky-300">●</span> Outlook
      </p>
    </div>
  );
}
