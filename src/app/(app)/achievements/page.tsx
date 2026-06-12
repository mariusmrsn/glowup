import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCharacter, getUserAchievements } from "@/server/queries/character";
import { createAdminClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { AchievementCard } from "@/components/game/AchievementCard";
import type { Achievement } from "@/types";

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, userAchievements, allAchievementsRes] = await Promise.all([
    getCharacter(session.user.id),
    getUserAchievements(session.user.id),
    createAdminClient().from("achievements").select("*").order("condition_value"),
  ]);

  const allAchievements = (allAchievementsRes.data as Achievement[]) ?? [];
  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievement_id, ua])
  );
  const unlockedCount = unlockedMap.size;

  return (
    <div>
      <TopBar title="Achievements" user={user} />
      <div className="p-4 lg:p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-lg font-black text-amber-400">
                {unlockedCount}/{allAchievements.length}
              </p>
              <p className="text-xs text-muted-foreground">freigeschaltet</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allAchievements.map((achievement, i) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              userAchievement={unlockedMap.get(achievement.id)}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
