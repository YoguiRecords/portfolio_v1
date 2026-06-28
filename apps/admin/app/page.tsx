import { logoutAction } from "@/lib/auth/actions";
import { requireEnrolledSession } from "@/lib/auth/guards";

/**
 * Protected back office home. Requires a fully-authenticated, MFA-enrolled
 * session — the guard redirects to login / verify / enrolment as needed.
 */
export default async function DashboardPage() {
  const session = await requireEnrolledSession();

  return (
    <main className="flex flex-1 flex-col gap-6 p-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-50">Back office</h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            Se déconnecter
          </button>
        </form>
      </header>
      <p className="text-zinc-400">
        Connecté en tant que <span className="text-zinc-100">{session.adminUser.email}</span>.
      </p>
    </main>
  );
}
