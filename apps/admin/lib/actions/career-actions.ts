"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db";
import { assertCanWrite, requirePermission } from "@/lib/auth/guards";
import {
  createTrack,
  deleteTrack,
  createMilestone,
  deleteMilestone,
  createGoal,
  deleteGoal,
  updateGoal,
  moveGoal,
} from "@/lib/content/career";
import { str } from "./form-utils";

/** Creates a career track from the editor form. */
export async function createTrackAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("career"));
  await createTrack(prisma, {
    name: str(form, "name"),
    slug: str(form, "slug"),
    colorHex: str(form, "colorHex") ?? "#f0a800",
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/parcours");
}

/** Deletes a career track. */
export async function deleteTrackAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("career"));
  const id = str(form, "id");
  if (id) await deleteTrack(prisma, id);
  revalidatePath("/parcours");
}

/** Creates a milestone on a track. */
export async function createMilestoneAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("career"));
  await createMilestone(prisma, {
    trackId: str(form, "trackId"),
    dateLabel: str(form, "dateLabel"),
    sortYear: Number(form.get("sortYear") ?? 0),
    role: str(form, "role"),
    description: str(form, "description"),
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/parcours");
}

/** Deletes a milestone. */
export async function deleteMilestoneAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("career"));
  const id = str(form, "id");
  if (id) await deleteMilestone(prisma, id);
  revalidatePath("/parcours");
}

/** Creates a career goal (« Le cap »). */
export async function createGoalAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("career"));
  await createGoal(prisma, {
    role: str(form, "role"),
    status: str(form, "status") ?? "TARGET",
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/parcours");
}

/** Deletes a career goal. */
export async function deleteGoalAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("career"));
  const id = str(form, "id");
  if (id) await deleteGoal(prisma, id);
  revalidatePath("/parcours");
}

/** Updates a career goal (role, status, order). */
export async function updateGoalAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("career"));
  await updateGoal(prisma, {
    id: str(form, "id"),
    role: str(form, "role"),
    status: str(form, "status") ?? "TARGET",
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/parcours");
}

/** Moves a goal up/down in the display order. */
export async function moveGoalAction(form: FormData): Promise<void> {
  assertCanWrite(await requirePermission("career"));
  const id = str(form, "id");
  const dir = str(form, "dir") === "up" ? "up" : "down";
  if (id) await moveGoal(prisma, id, dir);
  revalidatePath("/parcours");
}
