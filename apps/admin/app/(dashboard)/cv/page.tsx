import { prisma } from "@portfolio/db";
import { CvEditor } from "@/components/cv/cv-editor";

export const dynamic = "force-dynamic";

/** CV HTML editor (premium layout), rendered isolated via sandboxed iframe. */
export default async function CvPage() {
  const profile = await prisma.profile.findFirst({ select: { cvHtml: true } });
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">CV</h1>
      <p className="text-sm text-muted">
        Le CV est stocké en HTML et rendu de façon isolée (iframe sandbox) sur le site public.
      </p>
      <CvEditor initialHtml={profile?.cvHtml ?? ""} />
    </div>
  );
}
