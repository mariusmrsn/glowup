import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCharacter } from "@/server/queries/character";
import { getGoals } from "@/server/queries/goals";
import { TopBar } from "@/components/layout/TopBar";
import { CreateGoalDialog } from "@/components/game/CreateGoalDialog";
import { GoalsClient } from "./GoalsClient";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, goals] = await Promise.all([
    getCharacter(session.user.id),
    getGoals(session.user.id),
  ]);

  return (
    <div>
      <TopBar title="Meine Ziele" user={user} />
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {goals.filter((g) => !g.is_completed).length} aktive Ziele
          </p>
          <CreateGoalDialog />
        </div>
        <GoalsClient goals={goals} />
      </div>
    </div>
  );
}
