/**
 * Shared FormData readers for the BO Server Actions. Centralizes the tolerant
 * parsing conventions (empty string → undefined, one item per line…) that were
 * previously copy-pasted per action file.
 */

/** Reads an optional string field (empty/blank → undefined). */
export function str(form: FormData, key: string): string | undefined {
  const value = form.get(key);
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

/** Reads the required `id` field (undefined when absent/blank). */
export function reqId(form: FormData): string | undefined {
  return str(form, "id");
}

/** Splits a comma-separated field into trimmed, non-empty values. */
export function csv(form: FormData, key: string): string[] {
  return (str(form, key) ?? "")
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

/** Splits a textarea field into trimmed, non-empty lines (one item per line). */
export function lines(form: FormData, key: string): string[] {
  return (str(form, key) ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
