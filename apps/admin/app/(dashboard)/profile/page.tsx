import { prisma } from "@portfolio/db";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

/** Profile editor (singleton). Translatable fields use LocalizedField in the
 *  fuller editor; this representative form covers the core identity fields. */
export default async function ProfilePage() {
  const profile = await prisma.profile.findFirst();

  return (
    <ProfileForm
      profile={{
        fullName: profile?.fullName ?? "",
        headline: profile?.headline ?? "",
        email: profile?.email ?? "",
        bio: profile?.bio ?? "",
        typewriterLines: profile?.typewriterLines ?? [],
        sigText: profile?.sigText ?? "",
      }}
    />
  );
}
