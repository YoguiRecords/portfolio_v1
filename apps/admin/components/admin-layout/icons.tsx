/**
 * Jeu d'icônes du BO v2 — SVG inline (zéro dépendance), tracées en `currentColor`
 * pour hériter de la couleur du token courant. Style « stroke » fin, 24×24.
 */
const PATHS: Record<string, string> = {
  dashboard: "M4 4h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 13h7v7H4z",
  mission: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  user: "M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  skills: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  path: "M3 4h13l-2 3 2 3H3zM3 4v16",
  project: "M3 7h18v13H3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  article: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h6",
  media: "M4 5h16v14H4zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM4 17l5-5 4 4 3-3 4 4",
  faq: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
  testimonial: "M12 3l2.9 6 6.1.5-4.6 4 1.4 6L12 16.7 6.8 19.5l1.4-6L3.6 9.5 9.7 9z",
  message: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  mail: "M4 5h16v14H4zM4 7l8 6 8-6",
  rdv: "M4 5h16v16H4zM4 9h16M8 3v4M16 3v4M9 15l2 2 4-4",
  agenda: "M4 5h16v16H4zM4 9h16M8 3v4M16 3v4",
  calendar: "M4 5h16v16H4zM4 9h16M8 3v4M16 3v4M12 12v3l2 1",
  chart: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  ai: "M9 3h6v3M9 21h6v-3M3 9h3v6H3M21 9h-3v6h3M7 7h10v10H7z",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19",
  plus: "M12 5v14M5 12h14",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  more: "M4 6h16M4 12h16M4 18h16",
};

export type IconName = keyof typeof PATHS;

/** Rend une icône du jeu BO v2 (héritée en `currentColor`). */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
