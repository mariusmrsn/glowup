import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getHabits, getTodayCompletions } from "@/server/queries/habits";
import { getCharacter } from "@/server/queries/character";
import { TopBar } from "@/components/layout/TopBar";
import { HabitCard } from "@/components/game/HabitCard";
import { CreateHabitDialog } from "@/components/game/CreateHabitDialog";

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, habits, completions] = await Promise.all([
    getCharacter(session.user.id),
    getHabits(session.user.id),
    getTodayCompletions(session.user.id),
  ]);

  const completedIds = new Set(completions.map((c) => c.habit_id));
  const active = habits.filter((h) => !h.is_archived);
  const completedToday = active.filter((h) => completedIds.has(h.id));

  return (
    <div>
      <TopBar title="Gewohnheiten" user={user} />
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {completedToday.length}/{active.length} heute erledigt
          </p>
          <CreateHabitDialog />
        </div>

        {active.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="font-semibold text-foreground mb-1">
              Starte deinen ersten Habit
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Kleine tägliche Gewohnheiten führen zu großen Veränderungen.
            </p>
            <CreateHabitDialog />
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((habit, i) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completedToday={completedIds.has(habit.id)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
