import { parseMarkdown } from "@portfolio/ui/markdown";
import styles from "./markdown.module.css";

/**
 * Markdown renderer (web) — styling only. The safe-by-construction parsing is
 * shared via `@portfolio/ui` (single security-critical implementation for web +
 * admin); here we just wrap it in the editorial `.prose` styles.
 */
export function Markdown({ content }: { content: string }) {
  return <div className={styles.prose}>{parseMarkdown(content)}</div>;
}
