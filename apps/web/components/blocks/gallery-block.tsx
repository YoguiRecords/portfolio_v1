import styles from "./blocks.module.css";

/** A gallery image (resolved from the project's ProjectImage relations). */
export interface GalleryImage {
  url: string;
  alt: string | null;
}

/** GALLERY block: the project's image gallery. */
export function GalleryBlock({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;
  return (
    <div className={styles.gallery}>
      {images.map((img, i) => (
        <figure key={`${img.url}-${i}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- external MinIO URL */}
          <img src={img.url} alt={img.alt ?? ""} />
        </figure>
      ))}
    </div>
  );
}
