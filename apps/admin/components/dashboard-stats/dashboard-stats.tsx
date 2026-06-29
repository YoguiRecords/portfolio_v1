import type { DashboardStats as Stats } from "@/lib/data/dashboard";

interface StatCard {
  label: string;
  value: number;
  /** Highlight when there is something needing attention. */
  alert?: boolean;
}

/** Dashboard overview: counters as cards (moderation/inbox alerts highlighted). */
export function DashboardStats({ stats }: { stats: Stats }) {
  const cards: StatCard[] = [
    { label: "Projets", value: stats.projects },
    { label: "Articles", value: stats.articles },
    { label: "Témoignages en attente", value: stats.pendingTestimonials, alert: stats.pendingTestimonials > 0 },
    { label: "Messages non lus", value: stats.unreadMessages, alert: stats.unreadMessages > 0 },
    { label: "RDV en attente", value: stats.pendingAppointments, alert: stats.pendingAppointments > 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg border p-5 ${
            card.alert ? "border-amber-500/50 bg-amber-500/5" : "border-zinc-800 bg-zinc-900"
          }`}
        >
          <div className={`text-3xl font-black ${card.alert ? "text-amber-400" : "text-zinc-100"}`}>
            {card.value}
          </div>
          <div className="mt-2 text-xs text-zinc-400">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
