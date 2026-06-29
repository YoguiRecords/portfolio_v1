import Link from "next/link";

/** Accès refusé : l'utilisateur n'a pas la permission du module demandé (RBAC). */
export default function ForbiddenPage() {
  return (
    <div className="flex max-w-md flex-col gap-3">
      <h1 className="text-2xl font-bold text-ink">Accès refusé</h1>
      <p className="text-sm text-muted">
        Votre compte n’a pas accès à cette section. Contactez le propriétaire du back office si vous
        pensez que c’est une erreur.
      </p>
      <Link href="/" className="text-sm text-accent hover:underline">
        ← Retour au tableau de bord
      </Link>
    </div>
  );
}
