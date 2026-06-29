import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEvent } from "../../../../lib/data/agenda";
import { EventDetails } from "../../../../components/feed/event-details";
import { Markdown } from "../../../../components/markdown/markdown";
import { Gallery, type MediaItem } from "../../../../components/gallery/gallery";
import styles from "../../../../components/feed/feed.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Évènement introuvable" };
  return { title: event.title, description: event.description ?? undefined };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const media: MediaItem[] = event.media.map((m) => ({
    id: m.media.id,
    kind: m.media.kind,
    url: m.media.url,
    alt: m.media.alt,
    externalUrl: m.media.externalUrl,
    posterUrl: m.media.posterUrl,
  }));

  return (
    <main>
      <header className={styles.header}>
        <div className="wrap">
          <div className={styles.eyebrow}>Agenda</div>
          <h1 className={styles.title}>{event.title}</h1>
        </div>
      </header>
      <EventDetails event={event} />
      <div className="wrap">
        {event.description ? <Markdown content={event.description} /> : null}
        <Gallery items={media} />
      </div>
    </main>
  );
}
