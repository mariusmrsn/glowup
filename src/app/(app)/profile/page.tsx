import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCharacter } from "@/server/queries/character";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LevelBadge } from "@/components/game/LevelBadge";
import { RankBadge } from "@/components/game/RankBadge";
import { StreakCounter } from "@/components/game/StreakCounter";
import { XPBar } from "@/components/game/XPBar";
import { getXpProgressInCurrentLevel } from "@/lib/xp";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getCharacter(session.user.id);
  if (!user) redirect("/login");

  const xpProgress = getXpProgressInCurrentLevel(Number(user.total_xp));

  return (
    <div>
      <TopBar title="Profil" user={user} />
      <div className="p-4 lg:p-6 max-w-xl mx-auto space-y-6">
        {/* Character card */}
        <div className="glass rounded-3xl p-8 text-center border border-indigo-500/10">
          <Avatar className="w-24 h-24 mx-auto ring-4 ring-indigo-500/30 ring-offset-4 ring-offset-background mb-4">
            <AvatarImage src={user.avatar_url ?? ""} />
            <AvatarFallback className="bg-indigo-500/20 text-indigo-300 text-3xl font-black">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-2xl font-black">{user.username}</h2>
          </div>

          <p className="text-muted-foreground text-sm mb-4">{user.title}</p>

          <div className="flex items-center justify-center gap-3 mb-6">
            <LevelBadge level={user.level} />
            <RankBadge rank={user.rank} />
          </div>

          <div className="max-w-xs mx-auto mb-4">
            <XPBar
              current={xpProgress.current}
              required={xpProgress.required}
              percentage={xpProgress.percentage}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Gesamt XP", value: Number(user.total_xp).toLocaleString() },
            { label: "Coins", value: user.coins.toLocaleString() },
            {
              label: "Aktueller Streak",
              value: <StreakCounter streak={user.current_streak} />,
            },
            {
              label: "Bester Streak",
              value: `${user.longest_streak} Tage`,
            },
            {
              label: "Dabei seit",
              value: new Date(user.created_at).toLocaleDateString("de-DE"),
            },
          ].map(({ label, value }) => (
            <div key={label} className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <div className="font-semibold text-foreground">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
