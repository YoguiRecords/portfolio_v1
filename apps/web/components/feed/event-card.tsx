import Link from "next/link";
import type { EventListItem } from "../../lib/data/agenda";
import { formatDateTime } from "../../lib/format";
import styles from "./feed.module.css";

/** Builds a short location line from an event's place fields. */
function place(event: EventListItem): string {
  if (event.isOnline) return "En ligne";
  return [event.locationName, event.city].filter(Boolean).join(" · ");
}

/** An agenda event teaser card linking to its detail page. */
export function EventCard({ event }: { event: EventListItem }) {
  return (
    <Link href={`/agenda/${event.slug}`} className={styles.card}>
      {event.cover ? (
        <div className={styles.thumb}>
          {/* eslint-disable-next-line @next/next/no-img-element -- external MinIO URL */}
          <img src={event.cover.url} alt={event.cover.alt ?? ""} loading="lazy" />
        </div>
      ) : null}
      <div className={styles.body}>
        <span className={styles.date}>{formatDateTime(event.startAt)}</span>
        <h3>{event.title}</h3>
        {place(event) ? <p>{place(event)}</p> : null}
      </div>
    </Link>
  );
}
