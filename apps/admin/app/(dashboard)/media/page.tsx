import { prisma } from "@portfolio/db";
import { uploadImageAction } from "@/lib/actions/media-actions";

export const dynamic = "force-dynamic";

/** Media library: secure image upload (→ webp/MinIO) + recent assets. */
export default async function MediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 24 });

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-zinc-50">Médias</h1>

      <form action={uploadImageAction} className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Importer une image</h2>
        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-amber-500 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-amber-950"
        />
        <input
          name="alt"
          placeholder="Texte alternatif (accessibilité / SEO)"
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        />
        <button type="submit" className="self-start rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-600">
          Importer (→ webp, EXIF supprimé)
        </button>
      </form>

      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        {assets.map((a) => (
          <figure key={a.id} className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
            {a.kind === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element -- MinIO asset preview
              <img src={a.url} alt={a.alt ?? ""} className="aspect-square w-full object-cover" />
            ) : (
              <div className="flex aspect-square items-center justify-center text-xs text-zinc-500">
                {a.kind}
              </div>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
