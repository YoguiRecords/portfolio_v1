import { prisma } from "@portfolio/db";
import { listCvExports } from "@/lib/content/cv-export";
import { generateCvPdfAction } from "@/lib/actions/cv-actions";

const LOCALES: Array<{ code: string; label: string }> = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

/** Formats a generation date in `fr-FR` (date + time). */
function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

/**
 * BO panel to (re)generate the CV PDF (FR + EN) via the internal cv-renderer and
 * download the last generated file per locale (served frozen from MinIO).
 */
export async function CvGeneratePanel() {
  const exports = await listCvExports(prisma);
  const byLocale = new Map(exports.map((e) => [e.locale, e]));

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">PDF du CV</h2>
        <p className="text-sm text-muted">
          Génère le document A4 (FR + EN) via le service interne, stocké figé et téléchargeable
          publiquement. Un clic régénère les deux langues.
        </p>
      </div>

      <form action={generateCvPdfAction}>
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-strong"
        >
          Générer le PDF (FR + EN)
        </button>
      </form>

      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {LOCALES.map(({ code, label }) => {
          const e = byLocale.get(code);
          return (
            <li key={code} className="flex items-center justify-between gap-4 p-3 text-sm">
              <span className="font-semibold text-ink">{label}</span>
              {e ? (
                <span className="flex items-center gap-3 text-muted">
                  <span>généré le {formatDate(e.generatedAt)}</span>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-accent hover:underline"
                  >
                    Télécharger
                  </a>
                </span>
              ) : (
                <span className="text-muted">jamais généré</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
