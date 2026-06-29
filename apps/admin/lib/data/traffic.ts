/**
 * Lecture du trafic d'audience depuis Umami (cookieless, RGPD). Configuration
 * **optionnelle** via variables d'env serveur : si l'une manque (ou si l'API
 * échoue), on renvoie un résumé « non configuré » plutôt que de planter le
 * dashboard.
 *
 *   - `UMAMI_API_URL`     — base de l'API Umami (ex. https://stats.example.com)
 *   - `UMAMI_API_TOKEN`   — jeton Bearer (lecture seule)
 *   - `UMAMI_WEBSITE_ID`  — identifiant du site suivi
 */
const DAY_MS = 86_400_000;

/** Résumé de trafic affiché au dashboard (valeurs nulles si non configuré). */
export interface TrafficSummary {
  configured: boolean;
  visitors: number | null;
  pageviews: number | null;
  /** Variation des visiteurs vs période précédente, en %. */
  deltaPct: number | null;
}

const NOT_CONFIGURED: TrafficSummary = {
  configured: false,
  visitors: null,
  pageviews: null,
  deltaPct: null,
};

function readConfig(): { baseUrl: string; token: string; websiteId: string } | null {
  const baseUrl = process.env.UMAMI_API_URL;
  const token = process.env.UMAMI_API_TOKEN;
  const websiteId = process.env.UMAMI_WEBSITE_ID;
  if (!baseUrl || !token || !websiteId) return null;
  return { baseUrl, token, websiteId };
}

/** Métrique Umami `{ value, prev }`. */
interface UmamiMetric {
  value?: number;
  prev?: number;
}

/**
 * Récupère visiteurs + pages vues sur une fenêtre glissante (30 j par défaut),
 * avec variation vs la période précédente. Tolérant aux pannes (fallback).
 *
 * @param now - horodatage de référence (ms) — injectable pour les tests.
 * @param windowDays - taille de la fenêtre en jours.
 */
export async function getTrafficSummary(now: number = Date.now(), windowDays = 30): Promise<TrafficSummary> {
  const config = readConfig();
  if (!config) return NOT_CONFIGURED;

  const startAt = now - windowDays * DAY_MS;
  const url = `${config.baseUrl}/api/websites/${config.websiteId}/stats?startAt=${startAt}&endAt=${now}`;
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${config.token}` },
      cache: "no-store",
    });
    if (!response.ok) return NOT_CONFIGURED;
    const data = (await response.json()) as { visitors?: UmamiMetric; pageviews?: UmamiMetric };
    const visitors = data.visitors?.value ?? null;
    const prev = data.visitors?.prev ?? null;
    const deltaPct =
      visitors !== null && prev !== null && prev > 0 ? Math.round(((visitors - prev) / prev) * 100) : null;
    return { configured: true, visitors, pageviews: data.pageviews?.value ?? null, deltaPct };
  } catch {
    // Réseau/API indisponible → fallback gracieux (le dashboard ne doit pas casser).
    return NOT_CONFIGURED;
  }
}
