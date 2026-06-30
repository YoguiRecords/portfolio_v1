export const dynamic = "force-dynamic";

/** Panneau droit par défaut (desktop) : invite à sélectionner un mail. La liste
 *  vit dans le layout de section ; en mobile elle occupe seule l'écran. */
export default function MailsIndexPage() {
  return (
    <div className="hidden h-full min-h-64 place-items-center rounded-lg border border-dashed border-border lg:grid">
      <p className="text-sm text-muted">Sélectionnez un mail pour le lire.</p>
    </div>
  );
}
