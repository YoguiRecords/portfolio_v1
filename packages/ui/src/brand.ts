/**
 * Brand constants — canonical source of truth for the gold accent shared by the
 * public site (`web`) and the back office (`admin`). Each app declares the same
 * literal in its `globals.css`; `brand.test.ts` asserts they stay in sync with
 * these values (drift guard), and JS consumers (meta theme-color, JSON-LD…) read
 * them directly from here.
 */
export const BRAND = {
  /** Signature gold. */
  accent: "#f0a800",
  /** Darker gold for hover / strong contrast. */
  accentStrong: "#c07800",
} as const;
