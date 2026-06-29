import Link from "next/link";
import styles from "./project-next.module.css";

/** Bottom navigation of a case-study: back to projects + the next project. */
export function ProjectNext({ next }: { next: { slug: string; title: string } | null }) {
  return (
    <nav className={styles.nav}>
      <Link href="/#work" className={styles.back}>
        ← Tous les projets
      </Link>
      {next ? (
        <Link href={`/projets/${next.slug}`} className={styles.next}>
          <span className={styles.lbl}>Projet suivant →</span>
          <span className={styles.ttl}>{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
