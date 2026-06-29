import type { ProjectDetail } from "../../lib/data/project";
import styles from "./project-hero.module.css";

type Project = ProjectDetail["project"];

/** Human label for a project type (eyebrow). */
const TYPE_LABELS: Record<Project["type"], string> = {
  GAME: "Jeu / Produit",
  SOFTWARE: "Produit / Logiciel",
  WEBSITE: "Site / Web",
  BUSINESS: "Stratégie & Business",
};

/**
 * Case-study hero: type eyebrow, title, standfirst, meta (role/period/status),
 * signature, technology tags and the optional cover.
 */
export function ProjectHero({ project }: { project: Project }) {
  return (
    <header className={styles.hero}>
      <div className="wrap">
        <div className={styles.eyebrow}>
          {TYPE_LABELS[project.type]}
          {project.statusLabel ? ` · ${project.statusLabel}` : ""}
        </div>
        <h1 className={styles.title}>{project.title}</h1>
        {project.tagline ? <p className={styles.tagline}>{project.tagline}</p> : null}

        <div className={styles.meta}>
          {project.role ? (
            <span>
              <b>Rôle</b> {project.role}
            </span>
          ) : null}
          {project.periodLabel ? (
            <span>
              <b>Période</b> {project.periodLabel}
            </span>
          ) : null}
        </div>

        {project.sigText ? <span className={`sig ${styles.sig}`}>{project.sigText}</span> : null}

        {project.technologies.length > 0 ? (
          <div className={styles.tags}>
            {project.technologies.map((t) => (
              <span key={t.slug}>{t.name}</span>
            ))}
          </div>
        ) : null}

        {project.cover ? (
          <figure className={styles.cover}>
            {/* eslint-disable-next-line @next/next/no-img-element -- external MinIO URL */}
            <img src={project.cover.url} alt={project.cover.alt ?? project.title} />
          </figure>
        ) : null}
      </div>
    </header>
  );
}
