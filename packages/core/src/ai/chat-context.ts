/** Public data fed to the chatbot context (never PII — no contact email/IP). */
export interface ChatContextInput {
  profile?: { fullName: string; headline: string; aiSummary?: string | null } | null;
  projects?: { title: string; summary: string }[];
  skills?: { name: string }[];
  articles?: { title: string }[];
  events?: { title: string; startAt: Date }[];
}

/**
 * Builds a compact, PUBLIC-only context string about Yohan for the chatbot. The
 * corpus is small, so it is injected directly into the prompt (no vector store).
 * Only public, non-PII fields are included.
 */
export function buildContext(input: ChatContextInput): string {
  const lines: string[] = [];
  if (input.profile) {
    lines.push(`Nom : ${input.profile.fullName}`);
    lines.push(`Titre : ${input.profile.headline}`);
    if (input.profile.aiSummary) lines.push(`Résumé : ${input.profile.aiSummary}`);
  }
  if (input.skills?.length) {
    lines.push(`Compétences : ${input.skills.map((s) => s.name).join(", ")}`);
  }
  if (input.projects?.length) {
    lines.push("Projets :");
    for (const p of input.projects) lines.push(`- ${p.title} : ${p.summary}`);
  }
  if (input.articles?.length) {
    lines.push(`Actualités : ${input.articles.map((a) => a.title).join(" · ")}`);
  }
  const [next, ...rest] = input.events ?? [];
  if (next) {
    const fmt = (d: Date) => d.toISOString().slice(0, 16).replace("T", " ");
    lines.push(`Prochain évènement : ${next.title} le ${fmt(next.startAt)} (UTC).`);
    if (rest.length) {
      lines.push(`Autres dates à venir : ${rest.map((e) => `${e.title} (${fmt(e.startAt)})`).join(" · ")}`);
    }
  }
  return lines.join("\n");
}
