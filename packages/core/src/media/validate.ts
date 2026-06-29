/**
 * Pure upload validation (mime / size / dimensions) — the first gate of the
 * secure image pipeline (cf. STACK_SECURITY). No I/O, fully unit-testable.
 */

/** Image mime types accepted before webp re-encoding. */
export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_DIMENSION = 6000; // px

export interface UploadCandidate {
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

export type UploadValidation = { ok: true } | { ok: false; error: string };

/**
 * Validates an upload candidate against the allowed mime types, the size cap and
 * the dimension cap.
 *
 * @returns `{ ok: true }` or `{ ok: false, error }` with a stable error code.
 */
export function validateUpload(input: UploadCandidate): UploadValidation {
  if (!(ALLOWED_IMAGE_MIME as readonly string[]).includes(input.mimeType)) {
    return { ok: false, error: "mime_not_allowed" };
  }
  if (input.sizeBytes <= 0 || input.sizeBytes > MAX_BYTES) {
    return { ok: false, error: "size_exceeded" };
  }
  if ((input.width && input.width > MAX_DIMENSION) || (input.height && input.height > MAX_DIMENSION)) {
    return { ok: false, error: "dimensions_exceeded" };
  }
  return { ok: true };
}
