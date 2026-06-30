/** Statut d'un objectif de carrière (miroir de l'enum Prisma GoalStatus). */
export type GoalStatus = "ACHIEVED" | "IN_PROGRESS" | "TARGET" | "HORIZON";

/** Forme minimale d'un objectif consommée par la trajectoire. */
export interface GoalLike {
  id: string;
  role: string;
  status: GoalStatus;
}

/** Rôle visuel d'un nœud sur la trajectoire. */
export type NodeKind = "done" | "now" | "next" | "far";

export interface GoalView {
  kind: NodeKind;
  /** Libellé court affiché en pastille mono (Acquis / En cours / …). */
  label: string;
}

const STATUS_VIEW: Record<GoalStatus, GoalView> = {
  ACHIEVED: { kind: "done", label: "Acquis" },
  IN_PROGRESS: { kind: "now", label: "En cours" },
  TARGET: { kind: "next", label: "Cible" },
  HORIZON: { kind: "far", label: "Horizon" },
};

/** Maps a goal status to its visual role + short label. */
export function goalToView(status: GoalStatus): GoalView {
  return STATUS_VIEW[status] ?? STATUS_VIEW.HORIZON;
}

export interface Point {
  x: number;
  y: number;
}

export interface LayoutNode {
  goal: GoalLike;
  view: GoalView;
  /** Position en % du conteneur (left/top), prête pour le style inline. */
  leftPct: number;
  topPct: number;
  /** Délai de reveal en secondes (transition-delay/animation-delay). */
  delay: number;
  isDest: boolean;
}

export interface Layout {
  nodes: LayoutNode[];
  nowIndex: number;
  /** Chemins en coordonnées du viewBox. */
  solidPath: string;
  dashedPath: string;
  /** Aire sous la courbe pleine (desktop uniquement ; "" en vertical). */
  areaPath: string;
  viewBox: { w: number; h: number };
}

export type Orientation = "horizontal" | "vertical";

/** Catmull-Rom → cubic bézier : courbe lisse passant par tous les points. */
function smoothPath(p: Point[]): string {
  if (p.length < 2) return p.length === 1 ? `M${p[0].x},${p[0].y}` : "";
  let d = `M${p[0].x},${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p[i + 1];
    d += ` C${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${
      p2.x - (p3.x - p1.x) / 6
    },${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`;
  }
  return d;
}

/** Index frontière : 1er IN_PROGRESS, sinon dernier ACHIEVED, sinon -1. */
function frontierIndex(goals: GoalLike[]): number {
  const inProgress = goals.findIndex((g) => g.status === "IN_PROGRESS");
  if (inProgress >= 0) return inProgress;
  let lastDone = -1;
  goals.forEach((g, i) => {
    if (g.status === "ACHIEVED") lastDone = i;
  });
  return lastDone;
}

/**
 * Computes the trajectory geometry for `goals` in the given orientation.
 * Horizontal (desktop): viewBox 1000×480, ascending left→right.
 * Vertical (mobile): viewBox 100×680, ascending bottom→top.
 */
export function computeLayout(goals: GoalLike[], orientation: Orientation): Layout {
  const n = goals.length;
  const horizontal = orientation === "horizontal";
  const w = horizontal ? 1000 : 100;
  const h = horizontal ? 480 : 680;
  const padL = horizontal ? 66 : 15;
  const padR = horizontal ? 66 : 0;
  const padT = horizontal ? 66 : 54;
  const padB = horizontal ? 96 : 50;
  const nowIndex = frontierIndex(goals);

  const points: Point[] = goals.map((_, i) => {
    const t = n <= 1 ? 0 : i / (n - 1);
    if (horizontal) {
      return { x: padL + t * (w - padL - padR), y: h - padB - t * (h - padB - padT) };
    }
    // vertical : Développeur en bas (y grand) → CEO en haut (y petit)
    return { x: padL + i * 1.45, y: h - padB - t * (h - padB - padT) };
  });

  const baseY = h - padB + 26;
  const solidPts = nowIndex >= 0 ? points.slice(0, nowIndex + 1) : [];
  const dashedPts = nowIndex >= 0 ? points.slice(nowIndex) : points;
  const solidPath = smoothPath(solidPts);
  const dashedPath = smoothPath(dashedPts);
  const areaPath =
    horizontal && solidPts.length >= 2
      ? `${solidPath} L${solidPts[solidPts.length - 1].x},${baseY} L${solidPts[0].x},${baseY} Z`
      : "";

  const nodes: LayoutNode[] = goals.map((goal, i) => {
    const p = points[i];
    const base = nowIndex >= 0 ? nowIndex : -1;
    const delay =
      i <= base ? 0.1 + i * 0.5 : 0.1 + (base + 1) * 0.5 + (i - base) * 0.45;
    return {
      goal,
      view: goalToView(goal.status),
      leftPct: (p.x / w) * 100,
      topPct: (p.y / h) * 100,
      delay: Number(delay.toFixed(2)),
      isDest: i === n - 1,
    };
  });

  return { nodes, nowIndex, solidPath, dashedPath, areaPath, viewBox: { w, h } };
}
