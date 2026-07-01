import { expect, test } from "vitest";
import { ContactInput, AppointmentInput, BookingInput } from "./schema";

test("ContactInput accepte un message valide, rejette un email invalide", () => {
  expect(
    ContactInput.safeParse({ name: "X", email: "a@b.com", message: "Bonjour, un message." }).success,
  ).toBe(true);
  expect(
    ContactInput.safeParse({ name: "X", email: "pas-un-email", message: "Bonjour, un message." })
      .success,
  ).toBe(false);
});

test("ContactInput rejette un message trop court", () => {
  expect(ContactInput.safeParse({ name: "X", email: "a@b.com", message: "court" }).success).toBe(
    false,
  );
});

test("AppointmentInput coerce requestedAt en Date", () => {
  const r = AppointmentInput.safeParse({
    name: "X",
    email: "a@b.com",
    requestedAt: "2026-09-15T18:30:00Z",
  });
  expect(r.success).toBe(true);
  expect(r.success && r.data.requestedAt instanceof Date).toBe(true);
});

test("BookingInput accepte une réservation complète", () => {
  const r = BookingInput.safeParse({
    firstName: "Marc",
    lastName: "Durand",
    email: "marc@durand.fr",
    phone: "+33612345678",
    reason: "Projet web",
    requestedAt: "2026-09-15T08:00:00Z",
  });
  expect(r.success).toBe(true);
  expect(r.success && r.data.requestedAt instanceof Date).toBe(true);
});

test("BookingInput rejette un téléphone ou une identité manquants", () => {
  expect(
    BookingInput.safeParse({
      firstName: "Marc",
      lastName: "Durand",
      email: "marc@durand.fr",
      reason: "Projet",
      requestedAt: "2026-09-15T08:00:00Z",
    }).success,
  ).toBe(false);
  expect(
    BookingInput.safeParse({
      firstName: "",
      lastName: "Durand",
      email: "marc@durand.fr",
      phone: "+33612345678",
      reason: "Projet",
      requestedAt: "2026-09-15T08:00:00Z",
    }).success,
  ).toBe(false);
});
