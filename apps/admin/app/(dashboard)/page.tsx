import { getDashboardStats } from "@/lib/data/dashboard";
import { DashboardStats } from "@/components/dashboard-stats/dashboard-stats";

export const dynamic = "force-dynamic";

/** Back-office home: overview counters (content + moderation/inbox alerts). */
export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-zinc-50">Tableau de bord</h1>
      <DashboardStats stats={stats} />
    </div>
  );
}
