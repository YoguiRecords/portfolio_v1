import { isReadOnly, type AdminRole } from "@portfolio/core";

/** Masque un email : `john.doe@example.com` → `j•••@•••.com`. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "•••";
  const maskedLocal = local.length <= 1 ? local : `${local[0]}•••`;
  const parts = domain.split(".");
  const tld = parts.length > 1 ? parts[parts.length - 1] : "";
  return `${maskedLocal}@•••${tld ? `.${tld}` : ""}`;
}

/**
 * Masque une donnée perso pour le rôle VIEWER (mode démo/recruteur) ; renvoie la
 * valeur intacte pour les autres rôles. Les emails sont partiellement masqués,
 * les autres valeurs entièrement.
 */
export function maskPii(value: string | null | undefined, viewer: { role: AdminRole }): string {
  if (value == null || value === "") return "";
  if (!isReadOnly(viewer)) return value;
  return value.includes("@") ? maskEmail(value) : "•••";
}
