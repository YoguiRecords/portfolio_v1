import { KpiCard } from "@/components/ui";
import { getDashboardData } from "@/lib/data/dashboard";
import { ContentToTreatPanel } from "@/components/dashboard/content-to-treat-panel";
import { TopContentPanel } from "@/components/dashboard/top-content-panel";
import { TrafficPanel } from "@/components/dashboard/traffic-panel";

export const dynamic = "force-dynamic";

/** Back-office home: portfolio & audience overview (distinct from Mission Control). */
export default async function DashboardPage() {
  const { kpis, traffic, contentToTreat, topContent } = await getDashboardData();
  const visitorsTrend = traffic.deltaPct === null ? "flat" : traffic.deltaPct >= 0 ? "up" : "down";
  const visitorsDelta =
    traffic.deltaPct === null ? undefined : `${traffic.deltaPct >= 0 ? "+" : ""}${traffic.deltaPct} %`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Tableau de bord</h1>
        <p className="text-sm text-muted">Vue d’ensemble du portfolio et de l’audience.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Visiteurs (30 j)" value={traffic.visitors ?? "—"} trend={visitorsTrend} delta={visitorsDelta} />
        <KpiCard label="Projets" value={kpis.projects} />
        <KpiCard label="Articles" value={kpis.articles} />
        <KpiCard
          label="Témoignages à valider"
          value={kpis.pendingTestimonials}
          trend={kpis.pendingTestimonials > 0 ? "up" : "flat"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrafficPanel traffic={traffic} />
        <ContentToTreatPanel data={contentToTreat} />
      </div>

      <TopContentPanel items={topContent} />
    </div>
  );
}
