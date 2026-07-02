"use client";

import { useEffect, useState } from "react";
import { groupSlotsByDay } from "../../lib/booking/slots";

/**
 * Real-availability slot picker (client island). Loads the free slots from
 * `/api/availability` and renders them grouped by Paris day. Optional by
 * default: the first option submits no slot ("no precise slot").
 */
export function SlotSelect({
  name,
  id,
  locale = "fr",
}: {
  name: string;
  id?: string;
  locale?: string;
}) {
  const [slots, setSlots] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/availability")
      .then(async (res) => {
        const data = (await res.json()) as { slots?: string[] };
        if (active) setSlots(Array.isArray(data.slots) ? data.slots : []);
      })
      .catch(() => {
        if (active) setSlots([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const placeholder =
    slots === null
      ? "Chargement des créneaux…"
      : slots.length
        ? "— Aucun créneau précis —"
        : "Aucun créneau disponible — précisez vos disponibilités en message";

  return (
    <select name={name} id={id} defaultValue="">
      <option value="">{placeholder}</option>
      {groupSlotsByDay(slots ?? [], locale).map((group) => (
        <optgroup key={group.dayLabel} label={group.dayLabel}>
          {group.slots.map((slot) => (
            <option key={slot.iso} value={slot.iso}>
              {slot.timeLabel}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
