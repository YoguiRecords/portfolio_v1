import { prisma } from "@portfolio/db";
import { getSettings } from "@/lib/content/site-settings";
import { SettingsForm } from "@/components/settings-form";

export const dynamic = "force-dynamic";

/** Site settings editor (branding, SEO defaults, footer, contact, AI crawlers). */
export default async function SettingsPage() {
  const settings = await getSettings(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Réglages du site</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
