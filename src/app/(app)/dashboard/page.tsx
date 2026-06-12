import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getCharacter,
  getAttributes,
  getRecentActivity,
} from "@/server/queries/character";
import {
  getHabits,
  getTodayCompletions,
  getDailyQuests,
} from "@/server/queries/habits";
import { generateDailyQuests } from "@/server/actions/quests";
import { TopBar } from "@/components/layout/TopBar";
import { XPBar } from "@/components/game/XPBar";
import { LevelBadge } from "@/components/game/LevelBadge";
import { RankBadge } from "@/components/game/RankBadge";
import { StreakCounter } from "@/components/game/StreakCounter";
import { HabitCard } from "@/components/game/HabitCard";
import { QuestCard } from "@/components/game/QuestCard";
import { AttributeCard } from "@/components/game/AttributeCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getXpProgressInCurrentLevel } from "@/lib/xp";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Zap, Swords, CheckSquare, Activity } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Generate quests lazily (no-op if already generated today)
  await generateDailyQuests();

  // Parallel data fetch
  const [user, attributes, habits, completions, quests, activity] =
    await Promise.all([
      getCharacter(session.user.id),
      getAttributes(session.user.id),
      getHabits(session.user.id),
      getTodayCompletions(session.user.id),
      getDailyQuests(session.user.id),
      getRecentActivity(session.user.id, 8),
    ]);

  if (!user) redirect("/login");

  const xpProgress = getXpProgressInCurrentLevel(Number(user.total_xp));
  const completedHabitIds = new Set(completions.map((c) => c.habit_id));
  const todayHabits = habits.slice(0, 4);
  const todayQuestsCompleted = quests.filter((q) => q.is_completed).length;

  return (
    <div>
      <TopBar title="Dashboard" user={user} />

      <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Character Hero Panel */}
        <div className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-indigo-500/10">
          <div className="relative">
            <Avatar className="w-20 h-20 md:w-24 md:h-24 ring-4 ring-indigo-500/30 ring-offset-2 ring-offset-background">
              <AvatarImage src={user.avatar_url ?? ""} />
              <AvatarFallback className="bg-indigo-500/20 text-indigo-300 text-2xl font-black">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2">
              <LevelBadge level={user.level} size="sm" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                {user.username}
              </h2>
              <RankBadge rank={user.rank} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">{user.title}</p>

            <XPBar
              current={xpProgress.current}
              required={xpProgress.required}
              percentage={xpProgress.percentage}
              size="lg"
            />

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <StreakCounter streak={user.current_streak} />
              <div className="flex items-center gap-1.5 text-sm">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-indigo-400">
                  {Number(user.total_xp).toLocaleString()}
                </span>
                <span className="text-muted-foreground">XP gesamt</span>
              </div>
            </div>
          </div>

          {/* Stats mini grid */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { label: "Level", value: user.level, color: "#6366f1" },
              { label: "Streak", value: `${user.current_streak}d`, color: "#f97316" },
              { label: "Coins", value: user.coins.toLocaleString(), color: "#f59e0b" },
              {
                label: "Quests",
                value: `${todayQuestsCompleted}/${quests.length}`,
                color: "#10b981",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="glass-card rounded-xl px-4 py-3 text-center"
              >
                <p className="text-lg font-black" style={{ color }}>
                  {value}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Habits + Quests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Habits */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-semibold text-foreground">
                    Heutige Gewohnheiten
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {completedHabitIds.size}/{habits.length} erledigt
                </span>
              </div>

              {habits.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    Noch keine Gewohnheiten.
                  </p>
                  <a
                    href="/habits"
                    className="text-indigo-400 text-sm font-medium hover:underline mt-2 inline-block"
                  >
                    Erste Gewohnheit erstellen →
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayHabits.map((habit, i) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      completedToday={completedHabitIds.has(habit.id)}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Daily Quests */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Swords className="w-4 h-4 text-violet-400" />
                <h3 className="font-semibold text-foreground">Tägliche Quests</h3>
              </div>

              {quests.length === 0 ? (
                <div className="glass-card rounded-2xl p-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    Quests werden geladen...
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {quests.map((quest, i) => (
                    <QuestCard key={quest.id} quest={quest} index={i} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right: Attributes + Activity */}
          <div className="space-y-6">
            {/* Attribute Grid (mini) */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-foreground">Attribute</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {attributes.map((attr, i) => (
                  <AttributeCard key={attr.id} attribute={attr} index={i} />
                ))}
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Letzte Aktivitäten</h3>
              </div>
              <div className="glass-card rounded-2xl overflow-hidden">
                {activity.length === 0 ? (
                  <p className="text-muted-foreground text-sm p-4">
                    Noch keine Aktivitäten.
                  </p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {activity.map((a) => (
                      <li key={a.id} className="px-4 py-3 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">
                            {a.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(a.created_at), {
                              addSuffix: true,
                              locale: de,
                            })}
                          </p>
                        </div>
                        {a.xp_earned > 0 && (
                          <span className="text-xs font-semibold text-indigo-400 shrink-0">
                            +{a.xp_earned} XP
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
