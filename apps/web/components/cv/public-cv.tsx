import type { CvData } from "../../lib/data/cv";
import styles from "./public-cv.module.css";

const LABELS = {
  fr: {
    eyebrow: "Curriculum vitæ",
    download: "Télécharger le PDF",
    experience: "Expérience",
    projects: "Réalisations",
    education: "Formations",
    skills: "Compétences",
    soft: "Soft skills",
    languages: "Langues",
    interests: "Centres d’intérêt",
    stats: "En chiffres",
    start: "Prise de poste",
    mobility: "Mobilité",
    contract: "Contrat",
    today: "Aujourd’hui",
    keyProject: "Projet clé",
    inProgress: "En cours",
  },
  en: {
    eyebrow: "Résumé",
    download: "Download the PDF",
    experience: "Experience",
    projects: "Highlights",
    education: "Education",
    skills: "Skills",
    soft: "Soft skills",
    languages: "Languages",
    interests: "Interests",
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

function fmt(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function groupByCategory(skills: CvData["skills"]): Array<[string, string[]]> {
  const map = new Map<string, string[]>();
  for (const s of skills) {
    const cat = s.category ?? "Autres";
    map.set(cat, [...(map.get(cat) ?? []), s.name]);
  }
  return [...map.entries()];
}

const BADGE_LABEL: Record<string, keyof Labels> = { KEY: "keyProject", IN_PROGRESS: "inProgress" };

/**
 * Public CV page — rich, responsive projection of the corpus (more than the PDF:
 * long descriptions, all experiences/projects). Bilingual; offers the frozen PDF
 * downloads (FR/EN as available). Reuses the editorial dark + gold DA.
 */
export function PublicCv({ data }: { data: CvData }) {
  const { profile, experiences, education, skills, softSkills, projects, kpis, languages, interests, pdfs } =
    data;
  const t: Labels = LABELS[data.locale === "en" ? "en" : "fr"];
  const pdfLocales = (["fr", "en"] as const).filter((l) => pdfs[l]);

  return (
    <div className={styles.page}>
      <div className="wrap">
        <header className={styles.head}>
          <div>
            <div className={styles.eyebrow}>{t.eyebrow}</div>
            <h1 className={styles.name}>{profile?.fullName ?? "—"}</h1>
            {profile?.currentRole || profile?.headline ? (
              <div className={styles.role}>{profile?.currentRole ?? profile?.headline}</div>
            ) : null}
          </div>
          <div className={styles.downloads}>
            <span className={styles.dlLabel}>{t.download}</span>
            {pdfLocales.length > 0 ? (
              <div className={styles.dlRow}>
                {pdfLocales.map((l, i) => (
                  <a
                    key={l}
                    href={pdfs[l]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.dlBtn} ${i > 0 ? styles.dlBtnGhost : ""}`}
                  >
                    PDF {l.toUpperCase()}
                  </a>
                ))}
              </div>
            ) : (
              <span className={styles.dlEmpty}>Bientôt disponible.</span>
            )}
          </div>
        </header>

        {profile?.cvAccroche ? <p className={styles.accroche}>{profile.cvAccroche}</p> : null}

        {profile?.cvAvailabilityStart || profile?.cvMobility || profile?.cvContractType ? (
          <div className={styles.availRow}>
            {profile?.cvAvailabilityStart ? (
              <span className={styles.chip}>
                <b>{t.start}</b>
                {profile.cvAvailabilityStart}
              </span>
            ) : null}
            {profile?.cvMobility ? (
              <span className={styles.chip}>
                <b>{t.mobility}</b>
                {profile.cvMobility}
              </span>
            ) : null}
            {profile?.cvContractType ? (
              <span className={styles.chip}>
                <b>{t.contract}</b>
                {profile.cvContractType}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className={styles.body}>
          {/* Main column */}
          <div>
            {experiences.length > 0 ? (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t.experience}</h2>
                {experiences.map((e) => (
                  <article key={e.id} className={styles.exp}>
                    <div className={styles.expHead}>
                      <div className={styles.expTitle}>
                        {e.title} <span className={styles.expCompany}>· {e.company}</span>
                      </div>
                      <span className={styles.expDates}>
                        {fmt(e.startDate, data.locale)} — {e.endDate ? fmt(e.endDate, data.locale) : t.today}
                      </span>
                    </div>
                    {e.location ? <div className={styles.expMeta}>{e.location}</div> : null}
                    {e.description ? <p className={styles.expDesc}>{e.description}</p> : null}
                    {e.bullets.length > 0 ? (
                      <ul className={styles.bullets}>
                        {e.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                    {e.stack.length > 0 ? (
                      <div className={styles.stackRow}>
                        {e.stack.map((s) => (
                          <span key={s} className={styles.tag}>
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </section>
            ) : null}

            {projects.length > 0 ? (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t.projects}</h2>
                {projects.map((p) => (
                  <article key={p.id} className={styles.projCard}>
                    <div className={styles.projTitle}>
                      {p.title}
                      {p.cvBadge !== "NONE" ? (
                        <span className={`${styles.badge} ${p.cvBadge === "KEY" ? styles.badgeGold : styles.badgeOutline}`}>
                          {t[BADGE_LABEL[p.cvBadge]]}
                        </span>
                      ) : null}
                    </div>
                    <p className={styles.projSummary}>{p.summary}</p>
                  </article>
                ))}
              </section>
            ) : null}

            {education.length > 0 ? (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t.education}</h2>
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
          </div>

          {/* Aside */}
          <aside>
            {skills.length > 0 ? (
              <div className={styles.asideBlock}>
                <h2 className={styles.sectionTitle}>{t.skills}</h2>
                {groupByCategory(skills).map(([cat, names]) => (
                  <div key={cat}>
                    <div className={styles.skillCat}>{cat}</div>
                    <div className={styles.stackRow}>
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

            {kpis.length > 0 ? (
              <div className={styles.asideBlock}>
                <h2 className={styles.sectionTitle}>{t.stats}</h2>
                <div className={styles.statGrid}>
                  {kpis.map((k) => (
                    <div key={k.id} className={styles.statCard}>
                      <div className={styles.statValue}>{k.value}</div>
                      <div className={styles.statLabel}>{k.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {languages.length > 0 ? (
              <div className={styles.asideBlock}>
                <h2 className={styles.sectionTitle}>{t.languages}</h2>
                {languages.map((l) => (
                  <div key={l.id} className={styles.langRow}>
                    <span>{l.name}</span>
                    <span>{l.level}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {softSkills.length > 0 ? (
              <div className={styles.asideBlock}>
                <h2 className={styles.sectionTitle}>{t.soft}</h2>
                <ul className={styles.softList}>
                  {softSkills.map((s) => (
                    <li key={s.id}>{s.name}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {interests.length > 0 ? (
              <div className={styles.asideBlock}>
                <h2 className={styles.sectionTitle}>{t.interests}</h2>
                <ul className={styles.interestList}>
                  {interests.map((i) => (
                    <li key={i.id}>{i.label}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
