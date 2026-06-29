/** Concatène des classes Tailwind en ignorant les valeurs falsy (KISS, zéro dépendance). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
