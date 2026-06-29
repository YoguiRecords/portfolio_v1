import type { ReactNode } from "react";

/**
 * Renderer Markdown **safe-by-construction** (admin) : construit des éléments
 * React, jamais `dangerouslySetInnerHTML` → tout HTML embarqué est inerte (texte),
 * jamais exécuté (cf. STACK_SECURITY). Stylé via tokens Tailwind (pas de CSS module).
 *
 * Supporté : titres `##`/`###`, listes `- `, paragraphes, et inline `**gras**`,
 * `*italique*`, `` `code` ``, `[label](url)` (URLs http/https/mailto/relatives only).
 *
 * NB : portage du renderer de `apps/web/components/markdown` (dette : à extraire
 * dans `@portfolio/core` pour mutualiser — cf. resume.md).
 */
const WRAPPER =
  "text-sm leading-relaxed text-ink-2 [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-ink [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_li]:flex [&_li]:gap-2 [&_a]:text-accent [&_a]:underline [&_strong]:font-semibold [&_strong]:text-ink [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:text-xs";

export function Markdown({ content }: { content: string }) {
  return <div className={WRAPPER}>{parseBlocks(content)}</div>;
}

function parseBlocks(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    out.push(<p key={key++}>{parseInline(paragraph.join(" "))}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    out.push(
      <ul key={key++}>
        {list.map((item, i) => (
          <li key={i}>{parseInline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = /^(#{2,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = parseInline(heading[2]);
      out.push(level === 2 ? <h2 key={key++}>{text}</h2> : <h3 key={key++}>{text}</h3>);
      continue;
    }
    const listItem = /^[-*]\s+(.*)$/.exec(trimmed);
    if (listItem) {
      flushParagraph();
      list.push(listItem[1]);
      continue;
    }
    flushList();
    paragraph.push(trimmed);
  }
  flushParagraph();
  flushList();
  return out;
}

/** N'autorise que des cibles de lien sûres (pas de `javascript:` / `data:`). */
function safeHref(url: string): string | null {
  const value = url.trim();
  if (/^(https?:|mailto:)/i.test(value)) return value;
  if (value.startsWith("/") || value.startsWith("#")) return value;
  return null;
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of text.matchAll(INLINE)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));

    if (token.startsWith("**")) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={key++}>{token.slice(1, -1)}</code>);
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        const href = safeHref(link[2]);
        nodes.push(
          href ? (
            <a key={key++} href={href} rel="noopener noreferrer">
              {link[1]}
            </a>
          ) : (
            link[1]
          ),
        );
      }
    }
    lastIndex = index + token.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}
