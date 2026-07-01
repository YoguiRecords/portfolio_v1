import type { Metadata } from "next";
import { CancelBooking } from "../../../../components/forms/cancel-booking";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Annuler un rendez-vous",
  robots: { index: false, follow: false },
};

/** Public self-service cancellation page reached from the email link. */
export default async function CancelAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="chapter">
      <div className="wrap">
        <div className="marker">Rendez-vous</div>
        <h2>Annuler votre rendez-vous</h2>
        <p className="txt">
          Vous pouvez annuler votre rendez-vous ci-dessous. Le créneau sera aussitôt libéré.
        </p>
        <div style={{ marginTop: 32 }}>
          <CancelBooking token={token ?? ""} />
        </div>
      </div>
    </main>
  );
}
