"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { assertCanWrite, requirePermission } from "@/lib/auth/guards";
import { createEvent, deleteEvent, generateNewsFromEvent } from "@/lib/content/event";

function str(form: FormData, key: string): string | undefined {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

/** Creates an agenda event from the editor form. */
export async function createEventAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("agenda"));
  await createEvent(prisma, {
    title: str(form, "title"),
    slug: str(form, "slug"),
    description: str(form, "description"),
    startAt: str(form, "startAt"),
    locationName: str(form, "locationName"),
    city: str(form, "city"),
    registrationUrl: str(form, "registrationUrl"),
    isOnline: form.get("isOnline") === "on",
    status: str(form, "status") ?? "DRAFT",
    scheduledAt: str(form, "scheduledAt"),
  });
  revalidatePath("/agenda");
}

/** Generates a DRAFT news article from an event (manual). */
export async function generateNewsAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("agenda"));
  const id = str(form, "id");
  if (id) await generateNewsFromEvent(prisma, id);
  revalidatePath("/articles");
}

/** Deletes an event. */
export async function deleteEventAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("agenda"));
  const id = str(form, "id");
  if (id) await deleteEvent(prisma, id);
  revalidatePath("/agenda");
}
