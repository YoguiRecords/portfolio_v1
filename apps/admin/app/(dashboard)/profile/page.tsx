import { prisma } from "@portfolio/db";
import { ProfileForm } from "./profile-form";
import { ProfileSocials } from "./profile-socials";
import { ProfileAvatar } from "./profile-avatar";

export const dynamic = "force-dynamic";

/** Profile editor (singleton): identity fields, avatar, and social links. */
export default async function ProfilePage() {
  const profile = await prisma.profile.findFirst({
    include: { avatar: true, socials: { orderBy: { order: "asc" } } },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-10">
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
        }}
      />

      <ProfileAvatar currentUrl={profile?.avatar?.url ?? null} />

      <ProfileSocials socials={profile?.socials ?? []} />
    </div>
  );
}
