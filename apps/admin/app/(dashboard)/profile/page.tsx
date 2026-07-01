import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@portfolio/db";
import { PageContainer } from "@/components/ui";
import { ProfileForm } from "./profile-form";
import { ProfileSocials } from "./profile-socials";
import { ProfileAvatar } from "./profile-avatar";

export const dynamic = "force-dynamic";

/** Profile editor (singleton): identity fields, avatar, and social links. */
export default async function ProfilePage() {
  await requirePermission("profile");
  const profile = await prisma.profile.findFirst({
    include: { avatar: true, socials: { orderBy: { order: "asc" } } },
  });

  return (
    <PageContainer width="editor" gap={10}>
      <ProfileForm
        profile={{
          fullName: profile?.fullName ?? "",
          headline: profile?.headline ?? "",
          email: profile?.email ?? "",
          bio: profile?.bio ?? "",
          typewriterLines: profile?.typewriterLines ?? [],
          sigText: profile?.sigText ?? "",
          location: profile?.location ?? "",
          currentRole: profile?.currentRole ?? "",
          availabilityLabel: profile?.availabilityLabel ?? "",
          isAvailable: profile?.isAvailable ?? true,
          aiSummary: profile?.aiSummary ?? "",
          cvAccroche: profile?.cvAccroche ?? "",
          cvAvailabilityStart: profile?.cvAvailabilityStart ?? "",
          cvMobility: profile?.cvMobility ?? "",
          cvContractType: profile?.cvContractType ?? "",
        }}
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <ProfileAvatar currentUrl={profile?.avatar?.url ?? null} />
        <ProfileSocials socials={profile?.socials ?? []} />
      </div>
    </PageContainer>
  );
}
