/**
 * RBAC du back office — modèle de permissions **par module** (pur, testable,
 * sans dépendance serveur → importable partout). L'enforcement serveur vit dans
 * `apps/admin/lib/auth/guards.ts` (défense en profondeur : page + action).
 */

/** Modules du BO = clés de permission. */
export const BO_MODULES = [
  "dashboard",
  "mission-control",
  "profile",
  "content",
  "skills",
  "career",
  "analyses",
  "faq",
  "projects",
  "articles",
  "media",
  "agenda",
  "testimonials",
  "inbox",
  "appointments",
  "calendar",
  "contacts",
  "companies",
  "pipeline",
  "ai",
  "settings",
  "users",
] as const;

export type BoModule = (typeof BO_MODULES)[number];

/** Rôles = étiquette + préréglage de modules. */
export type AdminRole = "OWNER" | "EDITOR" | "SECRETARY" | "VIEWER";

/** Préréglages appliqués à la création d'un compte (ajustables ensuite par l'OWNER). */
export const ROLE_PRESETS: Record<AdminRole, BoModule[]> = {
  OWNER: [...BO_MODULES],
  EDITOR: [
    "dashboard",
    "profile",
    "content",
    "skills",
    "career",
    "analyses",
    "faq",
    "projects",
    "articles",
    "media",
    "agenda",
    "testimonials",
  ],
  SECRETARY: ["dashboard", "inbox", "appointments", "calendar", "agenda", "contacts"],
  // VIEWER : tous les modules mais en lecture seule (verrou d'écriture + masquage PII).
  VIEWER: [...BO_MODULES],
};

/** Sous-ensemble du compte nécessaire au calcul des permissions. */
export interface PermissionUser {
  role: AdminRole;
  permissions: string[];
}

function isModule(value: string): value is BoModule {
  return (BO_MODULES as readonly string[]).includes(value);
}

/** Permissions effectives d'un utilisateur (OWNER ⇒ tous les modules). */
export function effectivePermissions(user: PermissionUser): Set<BoModule> {
  if (user.role === "OWNER") return new Set(BO_MODULES);
  return new Set(user.permissions.filter(isModule));
}

/** Vrai si l'utilisateur a accès au module (OWNER bypass). */
export function can(user: PermissionUser, module: BoModule): boolean {
  if (user.role === "OWNER") return true;
  return effectivePermissions(user).has(module);
}

/** Préréglage de modules pour un rôle. */
export function presetFor(role: AdminRole): BoModule[] {
  return [...ROLE_PRESETS[role]];
}

/** Vrai si le compte est en lecture seule (rôle VIEWER) → mutations interdites. */
export function isReadOnly(user: { role: AdminRole }): boolean {
  return user.role === "VIEWER";
}
