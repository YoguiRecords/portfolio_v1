import Link from "next/link";
import styles from "./error-screen.module.css";

/**
 * Full-height branded error screen (404 / runtime error) — dark editorial DA:
 * oversized gold code, short message, primary CTA back home.
 */
export function ErrorScreen({
  code,
  title,
  message,
  action,
}: {
  code: string;
  title: string;
  message: string;
  /** Optional extra action (e.g. a retry button) rendered next to the CTA. */
  action?: React.ReactNode;
}) {
  return (
    <main className={styles.screen}>
      <div className={styles.inner}>
        <div aria-hidden="true" className={styles.code}>
          {code}
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Link href="/" className="btn btn-primary">
            Retour à l’accueil →
          </Link>
          {action}
        </div>
      </div>
    </main>
  );
}
