import { parseMarkdown } from "@portfolio/ui/markdown";

/**
 * Markdown renderer (admin) — styling only. The safe-by-construction parsing is
 * shared via `@portfolio/ui` (single security-critical implementation for web +
 * admin); here we just wrap it in the BO token styles.
 */
const WRAPPER =
  "text-sm leading-relaxed text-ink-2 [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-ink [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_li]:flex [&_li]:gap-2 [&_a]:text-accent [&_a]:underline [&_strong]:font-semibold [&_strong]:text-ink [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:text-xs";

export function Markdown({ content }: { content: string }) {
  return <div className={WRAPPER}>{parseMarkdown(content)}</div>;
}
