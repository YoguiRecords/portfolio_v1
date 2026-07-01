/**
 * Thin client for the admin app's internal booking API. The public web app
 * (read-only `app_web` role) never reads private RDV/calendar data directly: it
 * calls these token-guarded routes over the Docker `internal` network. Server
 * side only — the token must never reach the browser.
 */

function base(): string {
  return process.env.ADMIN_INTERNAL_URL ?? "http://admin:3101";
}

function headers(): Record<string, string> {
  return {
    "content-type": "application/json",
    "x-internal-token": process.env.APPOINTMENTS_INTERNAL_TOKEN ?? "",
  };
}

/** Fetches free slot starts (ISO) in `[fromIso, toIso]`. Returns [] on failure. */
export async function fetchFreeSlots(
  fromIso: string,
  toIso: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string[]> {
  const url = `${base()}/api/internal/availability?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`;
  const res = await fetchImpl(url, { headers: headers() });
  if (!res.ok) return [];
  const data = (await res.json()) as { slots?: unknown };
  return Array.isArray(data.slots) ? (data.slots as string[]) : [];
}

/** Submits a booking; returns the admin HTTP status (201 ok, 409 slot taken, 400 invalid). */
export async function submitBooking(
  payload: unknown,
  fetchImpl: typeof fetch = fetch,
): Promise<{ status: number }> {
  const res = await fetchImpl(`${base()}/api/internal/appointments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  return { status: res.status };
}

/** Cancels an appointment by its self-service token. Returns a generic result. */
export async function submitCancel(
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean }> {
  const res = await fetchImpl(`${base()}/api/internal/appointments/cancel`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ token }),
  });
  if (!res.ok) return { ok: false };
  const data = (await res.json()) as { ok?: unknown };
  return { ok: data.ok === true };
}
