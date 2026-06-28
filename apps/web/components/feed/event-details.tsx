import type { EventDetail } from "../../lib/data/agenda";
import { formatDateTime } from "../../lib/format";
import styles from "./feed.module.css";

/** Meta panel + external registration CTA for an event detail page. */
export function EventDetails({ event }: { event: EventDetail }) {
  const location = event.isOnline
    ? "En ligne"
    : [event.locationName, event.address, event.city].filter(Boolean).join(", ");

  return (
    <div className="wrap">
      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <b>Quand</b>
          <span>
            {formatDateTime(event.startAt)}
            {event.endAt ? ` → ${formatDateTime(event.endAt)}` : ""}
          </span>
        </div>
        {location ? (
          <div className={styles.metaRow}>
            <b>Où</b>
            <span>{location}</span>
          </div>
        ) : null}
        <div className={styles.metaRow}>
          <b>Accès</b>
          <span className={styles.badge}>Public</span>
        </div>
      </div>

      {event.registrationUrl ? (
        <a
          className="btn btn-primary"
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          S&apos;inscrire →
        </a>
      ) : null}
    </div>
  );
}
