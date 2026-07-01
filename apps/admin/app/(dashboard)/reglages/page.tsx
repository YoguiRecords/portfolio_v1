import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@portfolio/db";
import { PageContainer } from "@/components/ui";
import { getSettings } from "@/lib/content/site-settings";
import { SettingsForm } from "@/components/settings-form";

export const dynamic = "force-dynamic";

/** Site settings editor (branding, SEO defaults, footer, contact, AI crawlers). */
export default async function SettingsPage() {
  await requirePermission("settings");
  const settings = await getSettings(prisma);

  return (
    <PageContainer width="editor">
      <h1 className="text-2xl font-semibold text-ink">Réglages du site</h1>
      <SettingsForm settings={settings} />
    </PageContainer>
  );
}
