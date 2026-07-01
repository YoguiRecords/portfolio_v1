import { z } from "zod";

/**
 * BO input for declaring an unavailability / holiday range. `endAt` must be
 * strictly after `startAt`. The range blocks every candidate slot it overlaps.
 */
export const UnavailabilityInput = z
  .object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    reason: z.string().max(200).optional(),
  })
  .refine((v) => v.endAt > v.startAt, { message: "endAt doit être après startAt", path: ["endAt"] });

export type UnavailabilityInput = z.infer<typeof UnavailabilityInput>;
