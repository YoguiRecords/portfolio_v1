/** Renvoie jusqu'à deux initiales en majuscules à partir d'un nom complet. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Avatar rond : image si fournie, sinon repli sur les initiales. */
export function Avatar({ name, src, size = 32 }: { name: string; src?: string | null; size?: number }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatar arbitraire (MinIO/Graph), next/image non requis
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-label={name}
      className="inline-flex items-center justify-center rounded-full bg-surface-2 font-semibold text-ink-2"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </span>
  );
}
