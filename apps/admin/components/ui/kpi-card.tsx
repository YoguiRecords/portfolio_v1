import type { ReactNode } from "react";
import { cn } from "./cn";

type Trend = "up" | "down" | "flat";

const TREND_COLOR: Record<Trend, string> = {
  up: "text-ok",
  down: "text-danger",
  flat: "text-muted",
};

const TREND_ARROW: Record<Trend, string> = {
  up: "↗",
  down: "↘",
  flat: "→",
};

/** Carte de KPI : libellé, valeur forte, et delta coloré selon la tendance. */
export function KpiCard({
  label,
  value,
  trend = "flat",
  delta,
  icon,
}: {
  label: string;
  value: ReactNode;
  trend?: Trend;
  delta?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
        {icon ? <span className="text-muted">{icon}</span> : null}
      </div>
      <div className="mt-2 text-3xl font-extrabold text-ink">{value}</div>
      {delta ? (
        <div data-trend={trend} className={cn("mt-1 text-xs font-semibold", TREND_COLOR[trend])}>
          {TREND_ARROW[trend]} {delta}
        </div>
      ) : null}
    </div>
  );
}
