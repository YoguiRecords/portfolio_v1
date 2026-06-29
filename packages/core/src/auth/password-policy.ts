/**
 * Politique de mot de passe fort (NIST 800-63B) — validation **serveur**.
 * ≥ 12 caractères, rejet des mots de passe courants / répétitifs / séquentiels,
 * diversité de classes (sauf passphrase ≥ 16). Collage & passphrases autorisés,
 * pas de rotation forcée.
 *
 * NB : l'upgrade approuvé vers un score d'entropie **zxcvbn (≥ 3)** est prévu en
 * complément (dépendance) — cf. resume.md. Cette implémentation est le socle.
 */

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "motdepasse",
  "azertyuiop",
  "qwertyuiop",
  "123456789012",
  "1234567890",
  "111111111111",
  "iloveyou",
  "administrator",
  "welcome123",
  "letmein",
  "changeme",
  "secret123",
]);

const SEQUENCES = ["0123456789", "azertyuiop", "qwertyuiop", "abcdefghijklmnopqrstuvwxyz"];

export interface PasswordCheck {
  ok: boolean;
  error?: string;
}

/** Valide la robustesse d'un mot de passe. Renvoie `{ ok }` ou `{ ok:false, error }`. */
export function checkPasswordStrength(password: string): PasswordCheck {
  if (password.length < 12) {
    return { ok: false, error: "Le mot de passe doit comporter au moins 12 caractères." };
  }
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) {
    return { ok: false, error: "Ce mot de passe est trop courant." };
  }
  if (/^(.)\1+$/.test(password)) {
    return { ok: false, error: "Ce mot de passe est trop répétitif." };
  }
  if (SEQUENCES.some((seq) => seq.includes(lower) || seq.split("").reverse().join("").includes(lower))) {
    return { ok: false, error: "Évitez les suites de clavier évidentes." };
  }
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(password)).length;
  if (password.length < 16 && classes < 3) {
    return {
      ok: false,
      error: "Ajoutez majuscules, chiffres ou symboles — ou utilisez une phrase de passe plus longue.",
    };
  }
  return { ok: true };
}
