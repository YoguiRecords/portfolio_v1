import { createHash } from "node:crypto";

/** SHA-256 (hex) of a source string — used to detect FR changes vs a translation. */
export function hashSource(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
