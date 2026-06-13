import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getCharacter,
  getAttributes,
  getRecentActivity,
} from "@/server/queries/character";
import { getHabits, getTodayCompletions } from "@/server/queries/habits";
import { getGoals } from "@/server/queries/goals";
import { HabitCard } from "@/components/game/HabitCard";
import { CreateHabitDialog } from "@/components/game/CreateHabitDialog";
import { CreateGoalDialog } from "@/components/game/CreateGoalDialog";
import { DashboardHero } from "@/components/game/DashboardHero";
import { getXpProgressInCurrentLevel } from "@/lib/xp";
import { ChevronRight, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

const DAILY_IMPULSE = [
  { emoji: "🚀", title: "Woche stark starten", body: "Setze heute den Ton für die ganze Woche. Ein produktiver Montag zieht alles nach." },
  { emoji: "🔥", title: "Konsistenz schlägt Motivation", body: "Motivation kommt und geht — Gewohnheiten bleiben. Tick heute alles ab." },
  { emoji: "⚡", title: "Wochenmitte-Schub", body: "Halbzeit! Wenn du jetzt weiter machst, bist du am Freitag stolz auf dich." },
  { emoji: "🎯", title: "Fast am Ziel", body: "Donnerstag ist der unterschätzte Champion-Tag. Wer jetzt nicht aufgibt, gewinnt." },
  { emoji: "🏆", title: "Letzter Schub vor dem Wochenende", body: "Mach den Freitag zur stärksten Version deiner selbst. Du siehst das Ziel schon." },
  { emoji: "🌟", title: "Dein Wochenende, deine Regeln", body: "Ruhe ist keine Schwäche. Nutze den Tag bewusst — ob Pause oder Fortschritt." },
  { emoji: "📅", title: "Plane die Woche voraus", body: "Eine Stunde Planung am Sonntag spart sieben Stunden Chaos in der Woche." },
];

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, attributes, habits, completions, goals, activity] =
    await Promise.all([
      getCharacter(session.user.id),
      getAttributes(session.user.id),
      getHabits(session.user.id),
      getTodayCompletions(session.user.id),
      getGoals(session.user.id),
      getRecentActivity(session.user.id, 5),
    ]);

  if (!user) redirect("/login");

  const xpProgress = getXpProgressInCurrentLevel(Number(user.total_xp));
  const completedHabitIds = new Set(completions.map((c) => c.habit_id));
  const completedCount = completedHabitIds.size;
  const totalHabits = habits.length;
  const completionPct = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  const dayOfWeek = new Date().getDay();
  const impulse = DAILY_IMPULSE[dayOfWeek === 0 ? 6 : dayOfWeek - 1]!;

  const upcomingGoals = goals
    .filter((g) => !g.is_completed)
    .slice(0, 3);

  const colorMap: Record<string, string> = {
    strength: "#EF4444",
    intelligence: "#3B82F6",
    economy: "#F59E0B",
    discipline: "#8B5CF6",
    social: "#EC4899",
    health: "#10B981",
  };
  const labelMap: Record<string, string> = {
    strength: "Stärke",
    intelligence: "Intelligenz",
    economy: "Wirtschaft",
    discipline: "Disziplin",
    social: "Sozial",
    health: "Gesundheit",
  };
  const emojiMap: Record<string, string> = {
    strength: "💪",
    intelligence: "🧠",
    economy: "💰",
    discipline: "🎯",
    social: "💬",
    health: "❤️",
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";

  return (
    <div className="p-5 lg:p-7 max-w-4xl mx-auto space-y-6">

      {/* Animated hero */}
      <DashboardHero
        username={user.username}
        level={user.level}
        rank={user.rank}
        totalXp={Number(user.total_xp)}
        xpCurrent={xpProgress.current}
        xpRequired={xpProgress.required}
        xpPct={xpProgress.percentage}
        streak={user.current_streak}
        coins={user.coins}
        greeting={greeting}
      />

      {/* Tages-Impuls (replaces quests) */}
      <div className="app-card p-5 border-amber-500/20 bg-gradient-to-br from-amber-500/8 to-transparent">
        <div className="flex items-start gap-4">
          <span className="text-3xl shrink-0">{impulse.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500 mb-0.5">Tages-Impuls</p>
              {totalHabits > 0 && (
                <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                  {completedCount}/{totalHabits} Gewohnheiten
                </span>
              )}
            </div>
            <h3 className="font-semibold text-foreground mb-1">{impulse.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{impulse.body}</p>
            {totalHabits > 0 && (
              <div className="mt-3">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%`, backgroundColor: completionPct === 100 ? "#10B981" : "#F59E0B" }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {completionPct === 100 ? "🎉 Alle erledigt! Streak gesichert." : `${completionPct}% erledigt — weiter so!`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Habits + Goals in 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Habits */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Heute</h2>
              {totalHabits > 0 && (
                <p className="text-[11px] text-muted-foreground">{completedCount} von {totalHabits} erledigt</p>
              )}
            </div>
            <CreateHabitDialog />
          </div>

          {habits.length === 0 ? (
            <div className="app-card p-6 text-center border-dashed">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-sm text-muted-foreground mb-1 font-medium">Noch keine Gewohnheiten</p>
              <p className="text-xs text-muted-foreground">Starte deinen GlowUp jetzt!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.slice(0, 5).map((habit, i) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completedToday={completedHabitIds.has(habit.id)}
                  index={i}
                />
              ))}
              {habits.length > 5 && (
                <Link href="/habits" className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-indigo-400 py-2 transition-colors">
                  +{habits.length - 5} weitere <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Goals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Meine Ziele</h2>
              {upcomingGoals.length > 0 && (
                <p className="text-[11px] text-muted-foreground">{upcomingGoals.length} aktiv</p>
              )}
            </div>
            <CreateGoalDialog />
          </div>

          {upcomingGoals.length === 0 ? (
            <div className="app-card p-6 text-center border-dashed">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm text-muted-foreground mb-1 font-medium">Noch keine Ziele gesetzt</p>
              <p className="text-xs text-muted-foreground">Gib deinem GlowUp eine Richtung!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingGoals.map((goal) => {
                const daysLeft = getDaysUntil(goal.target_date);
                const isUrgent = daysLeft <= 7;
                return (
                  <div key={goal.id} className="app-card p-3.5 flex items-center gap-3">
                    <span className="text-2xl shrink-0">{goal.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{goal.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className={`text-[11px] font-medium ${isUrgent ? "text-orange-500" : "text-muted-foreground"}`}>
                          {daysLeft <= 0 ? "Heute!" : `Noch ${daysLeft} ${daysLeft === 1 ? "Tag" : "Tage"}`}
                        </span>
                      </div>
                    </div>
                    {isUrgent && daysLeft > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-500 font-semibold shrink-0">Bald!</span>
                    )}
                  </div>
                );
              })}
              {goals.filter(g => !g.is_completed).length > 3 && (
                <Link href="/goals" className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-amber-400 py-2 transition-colors">
                  Alle Ziele ansehen <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attributes quick view */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Attribute</h2>
          <Link href="/stats" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Details <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {attributes.map((attr) => {
            const color = colorMap[attr.type] ?? "#6366f1";
            return (
              <div key={attr.id} className="app-card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{emojiMap[attr.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{labelMap[attr.type] ?? attr.type}</p>
                    <p className="text-[10px] text-muted-foreground">Lv. {attr.level}</p>
                  </div>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (attr.level / 100) * 100 + 20)}%`, backgroundColor: color }}
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Letzte Aktivitäten</h2>
            <Link href="/stats" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              <TrendingUp className="w-3 h-3" /> Statistiken
            </Link>
          </div>
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
