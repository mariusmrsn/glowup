import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDailyQuests } from "@/server/queries/habits";
import { getCharacter } from "@/server/queries/character";
import { ensureDailyQuests } from "@/server/queries/quests";
import { TopBar } from "@/components/layout/TopBar";
import { QuestCard } from "@/components/game/QuestCard";

export default async function QuestsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await ensureDailyQuests(session.user.id);

  const [user, quests] = await Promise.all([
    getCharacter(session.user.id),
    getDailyQuests(session.user.id),
  ]);

  const completed = quests.filter((q) => q.is_completed).length;

  return (
    <div>
      <TopBar title="Tägliche Quests" user={user} />
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {completed}/{quests.length} Quests heute abgeschlossen
          </p>
          {completed === quests.length && quests.length > 0 && (
            <span className="text-sm font-semibold text-emerald-400">
              🎉 Alle erledigt!
            </span>
          )}
        </div>

        {quests.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Quests werden generiert...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {quests.map((quest, i) => (
              <QuestCard key={quest.id} quest={quest} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
