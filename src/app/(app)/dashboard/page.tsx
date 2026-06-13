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
import { ensureDailyQuests } from "@/server/queries/quests";
import { HabitCard } from "@/components/game/HabitCard";
import { QuestCard } from "@/components/game/QuestCard";
import { getXpProgressInCurrentLevel } from "@/lib/xp";
import { Flame, Zap } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await ensureDailyQuests(session.user.id);

  const [user, attributes, habits, completions, quests, activity] =
    await Promise.all([
      getCharacter(session.user.id),
      getAttributes(session.user.id),
      getHabits(session.user.id),
      getTodayCompletions(session.user.id),
      getDailyQuests(session.user.id),
      getRecentActivity(session.user.id, 5),
    ]);

  if (!user) redirect("/login");

  const xpProgress = getXpProgressInCurrentLevel(Number(user.total_xp));
  const completedHabitIds = new Set(completions.map((c) => c.habit_id));
  const completedQuests = quests.filter((q) => q.is_completed).length;

  return (
    <div className="p-5 lg:p-7 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Hallo, {user.username} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Lv. {user.level} · {user.rank}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="app-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-muted-foreground font-medium">XP</span>
          </div>
          <p className="text-xl font-bold text-foreground">{Number(user.total_xp).toLocaleString()}</p>
          <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${xpProgress.percentage}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {xpProgress.current} / {xpProgress.required} bis Lv. {user.level + 1}
          </p>
        </div>

        <div className="app-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-muted-foreground font-medium">Streak</span>
          </div>
          <p className="text-xl font-bold text-foreground">{user.current_streak}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {user.current_streak === 1 ? "Tag" : "Tage"} in Folge
          </p>
        </div>

        <div className="app-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🪙</span>
            <span className="text-xs text-muted-foreground font-medium">Coins</span>
          </div>
          <p className="text-xl font-bold text-foreground">{user.coins.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Gesammelt</p>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habits */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Heute</h2>
            <span className="text-xs text-muted-foreground">
              {completedHabitIds.size}/{habits.length} erledigt
            </span>
          </div>

          {habits.length === 0 ? (
            <div className="app-card p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">Noch keine Gewohnheiten.</p>
              <Link
                href="/habits"
                className="text-sm text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
              >
                Gewohnheit erstellen →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.map((habit, i) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completedToday={completedHabitIds.has(habit.id)}
                  index={i}
                />
              ))}
              {habits.length > 4 && (
                <Link href="/habits" className="block text-center text-xs text-muted-foreground hover:text-indigo-400 py-2 transition-colors">
                  Alle {habits.length} Gewohnheiten →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quests */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Tägliche Quests</h2>
            <span className="text-xs text-muted-foreground">{completedQuests}/{quests.length}</span>
          </div>

          {quests.length === 0 ? (
            <div className="app-card p-6 text-center">
              <p className="text-sm text-muted-foreground">Quests werden geladen...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {quests.map((quest, i) => (
                <QuestCard key={quest.id} quest={quest} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attribute overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Attribute</h2>
          <Link href="/attributes" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Alle →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {attributes.map((attr) => {
            const colorMap: Record<string, string> = {
              strength: "#ff453a",
              intelligence: "#0a84ff",
              economy: "#ff9f0a",
              discipline: "#bf5af2",
              social: "#ff375f",
              health: "#30d158",
            };
            const labelMap: Record<string, string> = {
              strength: "Stärke",
              intelligence: "Intelligenz",
              economy: "Wirtschaft",
              discipline: "Disziplin",
              social: "Sozial",
              health: "Gesundheit",
            };
            const color = colorMap[attr.type] ?? "#6366f1";
            return (
              <div key={attr.id} className="app-card p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground">{labelMap[attr.type] ?? attr.type}</span>
                  <span className="text-xs text-muted-foreground">Lv.{attr.level}</span>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: "40%", backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      {activity.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Letzte Aktivitäten</h2>
          <div className="app-card divide-y divide-border">
            {activity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <p className="flex-1 text-sm text-foreground truncate">{a.description}</p>
                {a.xp_earned > 0 && (
                  <span className="text-xs font-medium text-indigo-400 shrink-0">+{a.xp_earned} XP</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
