import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { buildTotpKeyUri, generateTotpSecret } from "@portfolio/core";
import { requireActiveSession } from "@/lib/auth/guards";
import { TotpEnrolForm } from "./totp-enrol-form";

/**
 * TOTP enrolment page (MFA mandatory). A fresh secret is generated per visit,
 * shown as a QR code, and only persisted once the admin confirms a valid code.
 * Already-enrolled admins are redirected away.
 */
export default async function TotpEnrolPage() {
  const session = await requireActiveSession();
  if (session.adminUser.isTotpEnabled) {
    redirect("/");
  }

  const secret = generateTotpSecret();
  const keyUri = buildTotpKeyUri(session.adminUser.email, secret);
  const qrDataUrl = await QRCode.toDataURL(keyUri);

  return (
    <main className="flex flex-1 items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-surface p-8">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-ink">Double authentification</h1>
          <p className="text-sm text-muted">
            Scannez ce QR code avec votre application d&apos;authentification, puis saisissez le
            code généré. Ne rechargez pas la page avant d&apos;avoir terminé.
          </p>
        </div>

        <div className="flex justify-center rounded-lg bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL, no remote asset */}
          <img src={qrDataUrl} alt="QR code d'enrôlement TOTP" width={200} height={200} />
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted">Saisie manuelle (si le scan échoue) :</p>
          <code className="block break-all rounded bg-bg px-3 py-2 text-xs text-ink-2">
            {secret}
          </code>
        </div>

        <TotpEnrolForm secret={secret} />
      </div>
    </main>
  );
}
