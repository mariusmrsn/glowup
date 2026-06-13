import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCharacter } from "@/server/queries/character";
import { getLeaderboard } from "@/server/queries/leaderboard";
import { TopBar } from "@/components/layout/TopBar";
import { LeaderboardClient } from "./LeaderboardClient";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, leaderboard] = await Promise.all([
    getCharacter(session.user.id),
    getLeaderboard(session.user.id),
  ]);

  return (
    <div>
      <TopBar title="Rangliste" user={user} />
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground mb-5">
          Folge anderen Nutzern und verfolge ihre Fortschritte.
        </p>
        <LeaderboardClient users={leaderboard} />
      </div>
    </div>
  );
}
