import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@portfolio/db";
import { CvEditor } from "@/components/cv/cv-editor";
import { CvGeneratePanel } from "@/components/cv/cv-generate-panel";

export const dynamic = "force-dynamic";

/** CV page: PDF generation panel (data-driven A4 document) + legacy HTML editor. */
export default async function CvPage() {
  await requirePermission("content");
  const profile = await prisma.profile.findFirst({ select: { cvHtml: true } });
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">CV</h1>

      <CvGeneratePanel />

      <p className="text-sm text-muted">
        Le CV HTML historique reste stocké et rendu de façon isolée (iframe sandbox).
      </p>
      <CvEditor initialHtml={profile?.cvHtml ?? ""} />
    </div>
  );
}
