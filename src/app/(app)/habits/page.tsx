import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getHabits, getTodayCompletions } from "@/server/queries/habits";
import { getCharacter } from "@/server/queries/character";
import { TopBar } from "@/components/layout/TopBar";
import { HabitsClient } from "./HabitsClient";

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, habits, completions] = await Promise.all([
    getCharacter(session.user.id),
    getHabits(session.user.id),
    getTodayCompletions(session.user.id),
  ]);

  const active = habits.filter((h) => !h.is_archived);
  const completedIds = completions.map((c) => c.habit_id);

  return (
    <div>
      <TopBar title="Gewohnheiten" user={user} />
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        <HabitsClient habits={active} completedIds={completedIds} />
      </div>
    </div>
  );
}
