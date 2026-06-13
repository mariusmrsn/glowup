import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCharacter, getAttributes } from "@/server/queries/character";
import { getHabitCompletionHistory } from "@/server/queries/habits";
import { isDemoUser, DEMO_COMPLETION_HISTORY } from "@/lib/demo-data";
import { TopBar } from "@/components/layout/TopBar";
import { StatsCharts } from "@/components/game/StatsCharts";
import { AttributeCard } from "@/components/game/AttributeCard";

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, attributes, completions] = await Promise.all([
    getCharacter(session.user.id),
    getAttributes(session.user.id),
    getHabitCompletionHistory(session.user.id, 30),
  ]);

  const last30Days = isDemoUser(session.user.id)
    ? DEMO_COMPLETION_HISTORY
    : (() => {
        const countsByDate = completions.reduce<Record<string, number>>((acc, c) => {
          acc[c.completed_at] = (acc[c.completed_at] ?? 0) + 1;
          return acc;
        }, {});
        return Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          const key = d.toISOString().split("T")[0]!;
          return { date: key, count: countsByDate[key] ?? 0, label: d.toLocaleDateString("de-DE", { month: "short", day: "numeric" }) };
        });
      })();

  const radarData = attributes.map((a) => ({
    type: a.type,
    level: a.level,
    xp: Number(a.total_xp),
  }));

  return (
    <div>
      <TopBar title="Statistiken & Attribute" user={user} />
      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-8">

        {/* Attribute section */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Deine Attribute</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Verbessere deine Attribute durch Gewohnheiten und tägliche Aktivität.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attributes.map((attr, i) => (
              <AttributeCard key={attr.id} attribute={attr} index={i} />
            ))}
          </div>
        </div>

        {/* Stats charts */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Statistiken</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Dein Fortschritt der letzten 30 Tage auf einen Blick.
            </p>
          </div>
          <StatsCharts
            user={user}
            completionHistory={last30Days}
            radarData={radarData}
          />
        </div>
      </div>
    </div>
  );
}
