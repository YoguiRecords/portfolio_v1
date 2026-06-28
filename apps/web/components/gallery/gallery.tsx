import styles from "./gallery.module.css";

/** A media item resolved from a MediaAsset (image, hosted video, or embed). */
export interface MediaItem {
  id: string;
  kind: "IMAGE" | "VIDEO" | "EMBED";
  url: string;
  alt: string | null;
  externalUrl: string | null;
  posterUrl: string | null;
}

/** Allows only http(s) embed/video sources (blocks javascript:/data: vectors). */
function safeSrc(url: string | null): string | null {
  if (!url) return null;
  return /^https?:\/\//i.test(url.trim()) ? url.trim() : null;
}

function GalleryMedia({ item }: { item: MediaItem }) {
  if (item.kind === "VIDEO") {
    const src = safeSrc(item.externalUrl) ?? item.url;
    return (
      <video controls preload="none" poster={item.posterUrl ?? undefined}>
        <source src={src} />
      </video>
    );
  }
  if (item.kind === "EMBED") {
    const src = safeSrc(item.externalUrl);
    if (!src) return null;
    return (
      <iframe
        src={src}
        title={item.alt ?? "Contenu intégré"}
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }
  // IMAGE
  // eslint-disable-next-line @next/next/no-img-element -- external MinIO URL, ratio-locked by CSS
  return <img src={item.url} alt={item.alt ?? ""} loading="lazy" />;
}

/**
 * Media gallery: renders images, hosted videos and external embeds with fixed
 * ratios (no layout shift) and lazy loading.
 */
export function Gallery({ items }: { items: MediaItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className={styles.gallery}>
      {items.map((item) => (
        <figure
          key={item.id}
          className={`${styles.item}${item.kind === "IMAGE" ? ` ${styles.image}` : ""}`}
        >
          <GalleryMedia item={item} />
        </figure>
      ))}
    </div>
  );
}
