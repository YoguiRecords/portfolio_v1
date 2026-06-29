import type { PrismaClient } from "@portfolio/db";
import { AppointmentInput } from "@portfolio/core";

/**
 * Function-calling tool definition exposed to the LLM so it can book a meeting
 * with Yohan when the visitor has a need.
 */
export const bookingTool = {
  type: "function",
  function: {
    name: "book_appointment",
    description:
      "Crée une demande de rendez-vous avec Yohan quand le visiteur exprime un besoin " +
      "(projet, mission, recrutement). À confirmer ensuite par Yohan.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nom du visiteur" },
        email: { type: "string", description: "Email du visiteur" },
        topic: { type: "string", description: "Sujet du rendez-vous" },
        requestedAt: { type: "string", description: "Créneau souhaité (ISO 8601), optionnel" },
      },
      required: ["name", "email"],
    },
  },
} as const;

/**
 * Handles a `book_appointment` tool call: validates args (Zod) and creates a
 * PENDING `AppointmentRequest` (source CHATBOT), confirmed later in the BO.
 *
 * @throws ZodError when the args are invalid.
 */
export async function bookAppointment(prisma: PrismaClient, rawArgs: unknown) {
  const args = AppointmentInput.parse(rawArgs);
  return prisma.appointmentRequest.create({
    data: {
      name: args.name,
      email: args.email,
      topic: args.topic,
      message: args.message,
      requestedAt: args.requestedAt,
      source: "CHATBOT",
    },
  });
}
