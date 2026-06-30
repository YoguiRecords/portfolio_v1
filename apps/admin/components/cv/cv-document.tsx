import type { CvDocumentData } from "@/lib/data/cv-document";
import styles from "./cv-document.module.css";

/** Localized section labels (FR base + EN). */
const LABELS = {
  fr: {
    contact: "Contact",
    availability: "Disponibilité",
    skills: "Compétences",
    languages: "Langues",
    soft: "Soft skills",
    interests: "Centres d’intérêt",
    experience: "Expérience",
    education: "Formations",
    projects: "Réalisations",
    stats: "En chiffres",
    start: "Prise de poste",
    mobility: "Mobilité",
    contract: "Contrat",
    today: "Aujourd’hui",
    keyProject: "Projet clé",
    inProgress: "En cours",
  },
  en: {
    contact: "Contact",
    availability: "Availability",
    skills: "Skills",
    languages: "Languages",
    soft: "Soft skills",
    interests: "Interests",
    experience: "Experience",
    education: "Education",
    projects: "Highlights",
    stats: "In numbers",
    start: "Start date",
    mobility: "Mobility",
    contract: "Contract",
    today: "Present",
    keyProject: "Key project",
    inProgress: "In progress",
  },
} as const;

type Labels = Record<keyof (typeof LABELS)["fr"], string>;

/** Formats a date as `MM/YYYY` in the active locale. */
function fmt(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function dateRange(start: Date, end: Date | null, t: Labels, locale: string): string {
  return `${fmt(start, locale)} — ${end ? fmt(end, locale) : t.today}`;
}

/** Groups TECH skills by their `category` (preserving order). */
function groupByCategory(skills: CvDocumentData["skills"]): Array<[string, string[]]> {
  const map = new Map<string, string[]>();
  for (const s of skills) {
    const cat = s.category ?? "Autres";
    map.set(cat, [...(map.get(cat) ?? []), s.name]);
  }
  return [...map.entries()];
}

const BADGE_LABEL: Record<string, keyof Labels> = {
  KEY: "keyProject",
  IN_PROGRESS: "inProgress",
};

/**
 * A4 one-page CV document — faithful editorial dark + gold layout, data-driven
 * (projection `showOnPdf`/`showOnCv`). Rendered on the internal admin route and
 * printed to PDF by the `cv-renderer` service. Bilingual (FR base / EN overlay).
 */
export function CvDocument({ data }: { data: CvDocumentData }) {
  const { profile, experiences, education, skills, softSkills, projects, kpis, languages, interests } =
    data;
  const t: Labels = LABELS[data.locale === "en" ? "en" : "fr"];

  const featured = experiences.filter((e) => e.tier === "FEATURED");
  const previous = experiences.filter((e) => e.tier === "PREVIOUS");
  const mini = experiences.filter((e) => e.tier === "MINI");

  return (
    <article className={styles.page}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.identity}>
          <div className={styles.name}>{profile?.fullName ?? "—"}</div>
          {profile?.currentRole || profile?.headline ? (
            <div className={styles.role}>{profile?.currentRole ?? profile?.headline}</div>
          ) : null}
        </div>

        <div className={styles.sideSection}>
          <div className={styles.sideTitle}>{t.contact}</div>
          {profile?.email ? <div className={styles.contactRow}>{profile.email}</div> : null}
          {profile?.location ? <div className={styles.contactRow}>{profile.location}</div> : null}
        </div>

        {profile?.cvAvailabilityStart || profile?.cvMobility || profile?.cvContractType ? (
          <div className={styles.sideSection}>
            <div className={styles.sideTitle}>{t.availability}</div>
            {profile?.cvAvailabilityStart ? (
              <div className={styles.availRow}>
                <span>{t.start}</span>
                <span>{profile.cvAvailabilityStart}</span>
              </div>
            ) : null}
            {profile?.cvMobility ? (
              <div className={styles.availRow}>
                <span>{t.mobility}</span>
                <span>{profile.cvMobility}</span>
              </div>
            ) : null}
            {profile?.cvContractType ? (
              <div className={styles.availRow}>
                <span>{t.contract}</span>
                <span>{profile.cvContractType}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {skills.length > 0 ? (
          <div className={styles.sideSection}>
            <div className={styles.sideTitle}>{t.skills}</div>
            {groupByCategory(skills).map(([cat, names]) => (
              <div key={cat}>
                <div className={styles.skillCat}>{cat}</div>
                <div className={styles.tagRow}>
                  {names.map((n) => (
                    <span key={n} className={styles.tag}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {languages.length > 0 ? (
          <div className={styles.sideSection}>
            <div className={styles.sideTitle}>{t.languages}</div>
            {languages.map((l) => (
              <div key={l.id} className={styles.availRow}>
                <span>{l.name}</span>
                <span>{l.level}</span>
              </div>
            ))}
          </div>
        ) : null}

        {softSkills.length > 0 ? (
          <div className={styles.sideSection}>
            <div className={styles.sideTitle}>{t.soft}</div>
            <ul className={styles.softList}>
              {softSkills.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {interests.length > 0 ? (
          <div className={styles.sideSection}>
            <div className={styles.sideTitle}>{t.interests}</div>
            <ul className={styles.interestList}>
              {interests.map((i) => (
                <li key={i.id}>{i.label}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>
        {profile?.cvAccroche ? <p className={styles.accroche}>{profile.cvAccroche}</p> : null}

        {experiences.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t.experience}</div>
            {featured.map((e) => (
              <div key={e.id} className={styles.exp}>
                <div className={styles.expHead}>
                  <div>
                    <span className={styles.expTitle}>{e.title}</span>{" "}
                    <span className={styles.expCompany}>· {e.company}</span>
                  </div>
                  <span className={styles.expDates}>{dateRange(e.startDate, e.endDate, t, data.locale)}</span>
                </div>
                {e.location || e.stack.length > 0 ? (
                  <div className={styles.expMeta}>
                    {e.location ?? ""}
                    {e.location && e.stack.length > 0 ? " · " : ""}
                    {e.stack.join(" · ")}
                  </div>
                ) : null}
                {e.bullets.length > 0 ? (
                  <ul className={styles.bullets}>
                    {e.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            {previous.map((e) => (
              <div key={e.id} className={`${styles.exp} ${styles.expPrevious}`}>
                <div className={styles.expHead}>
                  <div>
                    <span className={styles.expTitle}>{e.title}</span>{" "}
                    <span className={styles.expCompany}>· {e.company}</span>
                  </div>
                  <span className={styles.expDates}>{dateRange(e.startDate, e.endDate, t, data.locale)}</span>
                </div>
                {e.bullets.length > 0 ? (
                  <ul className={styles.bullets}>
                    {e.bullets.slice(0, 2).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            {mini.map((e) => (
              <div key={e.id} className={`${styles.exp} ${styles.expMini}`}>
                <div className={styles.miniRow}>
                  <div>
                    <span className={styles.expTitle}>{e.title}</span>{" "}
                    <span className={styles.expCompany}>· {e.company}</span>
                  </div>
                  <span className={styles.expDates}>{dateRange(e.startDate, e.endDate, t, data.locale)}</span>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {education.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t.education}</div>
            {education.map((ed) => (
              <div key={ed.id} className={styles.eduRow}>
                <div>
                  <div className={styles.eduTitle}>{ed.title}</div>
                  {ed.institution ? <div className={styles.eduInst}>{ed.institution}</div> : null}
                  {ed.details.length > 0 ? (
                    <div className={styles.eduInst}>{ed.details.join(" · ")}</div>
                  ) : null}
                </div>
                <span className={styles.expDates}>{ed.date}</span>
              </div>
            ))}
          </section>
        ) : null}

        {projects.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t.projects}</div>
            <div className={styles.projGrid}>
              {projects.map((p) => (
                <div key={p.id} className={styles.projCard}>
                  <div className={styles.projTitle}>
                    {p.title}
                    {p.cvBadge !== "NONE" ? (
                      <span className={`${styles.badge} ${p.cvBadge === "KEY" ? styles.badgeGold : styles.badgeOutline}`}>
                        {t[BADGE_LABEL[p.cvBadge]]}
                      </span>
                    ) : null}
                  </div>
                  <div className={styles.projSummary}>{p.summary}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {kpis.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t.stats}</div>
            <div className={styles.statGrid}>
              {kpis.map((k) => (
                <div key={k.id} className={styles.statCard}>
                  <div className={styles.statValue}>{k.value}</div>
                  <div className={styles.statLabel}>{k.label}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className={styles.footer}>{profile?.fullName ?? ""} — CV</div>
      </main>
    </article>
  );
}
