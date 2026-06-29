import { vi, beforeEach, expect, test } from "vitest";

const { redirect, getCurrentSession } = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  getCurrentSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("./session", () => ({ getCurrentSession }));

import { requireActiveSession, requireEnrolledSession } from "./guards";

beforeEach(() => {
  redirect.mockClear();
  getCurrentSession.mockReset();
});

test("sans session → redirect /login", async () => {
  getCurrentSession.mockResolvedValue(null);
  await expect(requireActiveSession()).rejects.toThrow("REDIRECT:/login");
});

test("session mfaPending → redirect /login/verify", async () => {
  getCurrentSession.mockResolvedValue({ mfaPending: true, adminUser: { isTotpEnabled: true } });
  await expect(requireActiveSession()).rejects.toThrow("REDIRECT:/login/verify");
});

test("session complète → renvoyée", async () => {
  const session = { mfaPending: false, adminUser: { isTotpEnabled: true, email: "a@b.com" } };
  getCurrentSession.mockResolvedValue(session);
  await expect(requireActiveSession()).resolves.toBe(session);
});

test("requireEnrolledSession sans TOTP → redirect /security/totp", async () => {
  getCurrentSession.mockResolvedValue({ mfaPending: false, adminUser: { isTotpEnabled: false } });
  await expect(requireEnrolledSession()).rejects.toThrow("REDIRECT:/security/totp");
});
