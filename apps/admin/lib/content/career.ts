import type { PrismaClient } from "@portfolio/db";
import {
  CareerTrackInput,
  CareerMilestoneInput,
  CareerGoalInput,
  CareerGoalUpdate,
} from "@portfolio/core";

/**
 * Career persistence (write side, `app_admin`): tracks (timeline lanes) with their
 * milestones, plus the career goals. All validated with Zod, injectable for tests.
 */

/** Lists tracks with their ordered milestones. */
export function listTracks(prisma: PrismaClient) {
  return prisma.careerTrack.findMany({
    orderBy: { order: "asc" },
    include: { milestones: { orderBy: { order: "asc" } } },
  });
}

/** Creates a track from validated input. */
export async function createTrack(prisma: PrismaClient, raw: unknown) {
  const data = CareerTrackInput.parse(raw);
  return prisma.careerTrack.create({ data });
}

/** Deletes a track (cascades to its milestones). */
export async function deleteTrack(prisma: PrismaClient, id: string) {
  await prisma.careerTrack.delete({ where: { id } });
}

/** Creates a milestone inside a track from validated input. */
export async function createMilestone(prisma: PrismaClient, raw: unknown) {
  const data = CareerMilestoneInput.parse(raw);
  return prisma.careerMilestone.create({ data });
}

/** Deletes a milestone by id. */
export async function deleteMilestone(prisma: PrismaClient, id: string) {
  await prisma.careerMilestone.delete({ where: { id } });
}

/** Lists career goals ordered for the editor. */
export function listGoals(prisma: PrismaClient) {
  return prisma.careerGoal.findMany({ orderBy: { order: "asc" } });
}

/** Creates a career goal from validated input. */
export async function createGoal(prisma: PrismaClient, raw: unknown) {
  const data = CareerGoalInput.parse(raw);
  return prisma.careerGoal.create({ data });
}

/** Deletes a career goal by id. */
export async function deleteGoal(prisma: PrismaClient, id: string) {
  await prisma.careerGoal.delete({ where: { id } });
}

/** Updates a goal's role/status/order from validated input. */
export async function updateGoal(prisma: PrismaClient, raw: unknown) {
  const { id, ...data } = CareerGoalUpdate.parse(raw);
  return prisma.careerGoal.update({ where: { id }, data });
}

/** Moves a goal up/down by swapping its `order` with the adjacent goal. */
export async function moveGoal(prisma: PrismaClient, id: string, dir: "up" | "down") {
  const goals = await prisma.careerGoal.findMany({ orderBy: { order: "asc" } });
  const i = goals.findIndex((g) => g.id === id);
  if (i < 0) return;
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= goals.length) return;
  await prisma.$transaction([
    prisma.careerGoal.update({ where: { id: goals[i].id }, data: { order: goals[j].order } }),
    prisma.careerGoal.update({ where: { id: goals[j].id }, data: { order: goals[i].order } }),
  ]);
}
