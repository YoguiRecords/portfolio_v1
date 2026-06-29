import type { Metadata } from "next";
import { getEvents } from "../../../lib/data/agenda";
import { EventCard } from "../../../components/feed/event-card";
import styles from "../../../components/feed/feed.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Les prochains évènements, meetups et conférences.",
};

export default async function AgendaPage() {
  const events = await getEvents();
  return (
    <main className="chapter">
      <div className="wrap">
        <div className="marker">Agenda</div>
        <h2>Où me croiser.</h2>
        {events.length === 0 ? (
          <p className="txt">Aucun évènement prévu pour le moment.</p>
        ) : (
          <div className={styles.list}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
