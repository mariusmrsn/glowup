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

  const userRank = user
    ? leaderboard.findIndex((u) => u.username === user.username) + 1
    : 0;

  return (
    <div>
      <TopBar title="Rangliste" user={user} />
      <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">

        {/* Hero */}
        <div className="app-card p-5 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent border-pink-500/20">
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0">🏆</span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-pink-500 mb-0.5">Globale Rangliste</p>
              <h2 className="text-lg font-bold text-foreground mb-1">Miss dich mit der Welt</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Schau, welchen Score deine Freunde haben — und wer in der globalen Rangliste ganz oben steht.
                Folge anderen Spielern und verfolge ihren Fortschritt live.
              </p>
              {userRank > 0 && (
                <p className="mt-2 text-xs font-semibold text-pink-500">
                  Dein aktueller Rang: #{userRank} von {leaderboard.length} Spielern
                </p>
              )}
            </div>
          </div>
        </div>

        <LeaderboardClient users={leaderboard} />
      </div>
    </div>
  );
}
