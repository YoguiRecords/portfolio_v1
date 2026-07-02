"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { assertCanWrite, requirePermission } from "@/lib/auth/guards";
import { createUnavailability, deleteUnavailability } from "@/lib/booking/unavailability";

/** Creates an unavailability (holiday / block) from the BO form. */
export async function createUnavailabilityAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("appointments"));
  const startAt = form.get("startAt");
  const endAt = form.get("endAt");
  const reason = form.get("reason");
  await createUnavailability(prisma, {
    startAt: typeof startAt === "string" ? startAt : "",
    endAt: typeof endAt === "string" ? endAt : "",
    reason: typeof reason === "string" && reason ? reason : undefined,
  });
  revalidatePath("/disponibilites");
  revalidatePath("/calendrier");
}

/** Deletes an unavailability by id. */
export async function deleteUnavailabilityAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("appointments"));
  const id = form.get("id");
  if (typeof id === "string" && id) await deleteUnavailability(prisma, id);
  revalidatePath("/disponibilites");
  revalidatePath("/calendrier");
}
