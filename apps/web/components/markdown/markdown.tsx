import type { ReactNode } from "react";
import styles from "./markdown.module.css";

/**
 * Minimal, **safe-by-construction** Markdown renderer. It builds React elements
 * directly — it never uses `dangerouslySetInnerHTML` — so any embedded HTML
 * (e.g. `<script>`) is rendered as inert text, not executed (cf. STACK_SECURITY).
 *
 * Supported: `#`/`##`/`###` headings, `- ` lists, paragraphs, and inline
 * `**bold**`, `*italic*`, `` `code` `` and `[label](url)` links (URLs limited to
 * http/https/mailto/relative to block `javascript:` vectors).
 */
export function Markdown({ content }: { content: string }) {
  const blocks = parseBlocks(content);
  return <div className={styles.prose}>{blocks}</div>;
}

/** Splits the source into block-level React elements. */
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

/** Allows only safe link targets (no `javascript:` / `data:` vectors). */
function safeHref(url: string): string | null {
  const value = url.trim();
  if (/^(https?:|mailto:)/i.test(value)) return value;
  if (value.startsWith("/") || value.startsWith("#")) return value;
  return null;
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

/** Parses inline markdown spans into React nodes (plain text otherwise). */
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
