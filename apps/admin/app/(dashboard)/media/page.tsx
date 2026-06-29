import { prisma } from "@portfolio/db";
import { uploadImageAction } from "@/lib/actions/media-actions";
import { Dropzone } from "@/components/media/dropzone";
import { MediaGrid, type MediaRow } from "@/components/media/media-grid";

export const dynamic = "force-dynamic";

/** Media library v2: dropzone (→ webp/MinIO) + grid with details panel. */
export default async function MediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 48 });
  const rows: MediaRow[] = assets.map((a) => ({
    id: a.id,
    url: a.url,
    alt: a.alt,
    originalName: a.originalName,
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes,
    width: a.width,
    height: a.height,
    kind: a.kind,
    durationSec: a.durationSec,
    createdAtLabel: a.createdAt.toLocaleDateString("fr-FR"),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Médias</h1>
      <Dropzone action={uploadImageAction} />
      <MediaGrid assets={rows} />
    </div>
  );
}
