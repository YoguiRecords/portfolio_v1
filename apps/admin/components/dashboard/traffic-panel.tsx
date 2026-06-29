import { Panel } from "@/components/ui";
import type { TrafficSummary } from "@/lib/data/traffic";

/** Carte trafic d'audience (30 j) — message de repli si Umami non configuré. */
export function TrafficPanel({ traffic }: { traffic: TrafficSummary }) {
  if (!traffic.configured) {
    return (
      <Panel title="Trafic (30 j)">
        <p className="text-sm text-muted">Statistiques d’audience non configurées (Umami).</p>
      </Panel>
    );
  }
  return (
    <Panel title="Trafic (30 j)">
      <div className="flex flex-wrap items-end gap-8">
        <div>
          <div className="text-3xl font-extrabold text-ink">{traffic.visitors ?? "—"}</div>
          <div className="text-xs text-muted">Visiteurs</div>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-ink">{traffic.pageviews ?? "—"}</div>
          <div className="text-xs text-muted">Pages vues</div>
        </div>
        {traffic.deltaPct !== null ? (
          <div className={`text-sm font-semibold ${traffic.deltaPct >= 0 ? "text-ok" : "text-danger"}`}>
            {traffic.deltaPct >= 0 ? "↗" : "↘"} {Math.abs(traffic.deltaPct)} % vs période précédente
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
