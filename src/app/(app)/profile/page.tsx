import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCharacter } from "@/server/queries/character";
import { TopBar } from "@/components/layout/TopBar";
import { LevelBadge } from "@/components/game/LevelBadge";
import { RankBadge } from "@/components/game/RankBadge";
import { StreakCounter } from "@/components/game/StreakCounter";
import { XPBar } from "@/components/game/XPBar";
import { getXpProgressInCurrentLevel } from "@/lib/xp";
import { ProfileEditClient } from "./ProfileEditClient";
import { createAdminClient } from "@/lib/supabase/server";
import { Coins, ExternalLink, Trophy } from "lucide-react";
import Link from "next/link";

async function getEquippedItems(userId: string) {
  if (userId === "demo-user-001") return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("user_items")
    .select("item_id, equipped, shop_items(id, name, icon, type, rarity)")
    .eq("user_id", userId)
    .eq("equipped", true);
  return (data ?? []) as unknown as Array<{
    item_id: string;
    equipped: boolean;
    shop_items: { id: string; name: string; icon: string; type: string; rarity: string };
  }>;
}

const RARITY_COLOR: Record<string, string> = {
  common: "#94a3b8",
  rare: "#3B82F6",
  epic: "#8B5CF6",
  legendary: "#F59E0B",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, equipped] = await Promise.all([
    getCharacter(session.user.id),
    getEquippedItems(session.user.id),
  ]);
  if (!user) redirect("/login");

  const xpProgress = getXpProgressInCurrentLevel(Number(user.total_xp));
  const extUser = user as typeof user & { height_cm?: number | null; weight_kg?: number | null; bio?: string | null };

  const badges = equipped.filter((e) => e.shop_items?.type === "badge");
  const titleItem = equipped.find((e) => e.shop_items?.type === "title");

  return (
    <div>
      <TopBar title="Profil" user={user} />
      <div className="p-4 lg:p-6 max-w-xl mx-auto space-y-5">
        {/* Character card */}
        <div className="app-card p-6 text-center">
          {badges.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {badges.slice(0, 5).map((b) => (
                <span key={b.item_id} title={b.shop_items.name} className="text-xl">{b.shop_items.icon}</span>
              ))}
            </div>
          )}

          <h2 className="text-2xl font-black text-foreground">{user.username}</h2>

          {titleItem ? (
            <p className="text-sm font-semibold mt-0.5" style={{ color: RARITY_COLOR[titleItem.shop_items.rarity] }}>
              {titleItem.shop_items.icon} {titleItem.shop_items.name}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">{user.title}</p>
          )}

          <div className="flex items-center justify-center gap-3 mt-3 mb-4">
            <LevelBadge level={user.level} />
            <RankBadge rank={user.rank} />
          </div>

          <div className="max-w-xs mx-auto mb-4">
            <XPBar current={xpProgress.current} required={xpProgress.required} percentage={xpProgress.percentage} />
          </div>

          <div className="border-t border-border pt-4 mt-2">
            <ProfileEditClient user={extUser} />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Gesamt XP", value: Number(user.total_xp).toLocaleString(), icon: "⚡" },
            { label: "Coins", value: user.coins.toLocaleString(), icon: "🪙" },
            { label: "Aktueller Streak", value: <StreakCounter streak={user.current_streak} />, icon: "🔥" },
            { label: "Bester Streak", value: `${user.longest_streak} Tage`, icon: "🏆" },
            { label: "Dabei seit", value: new Date(user.created_at).toLocaleDateString("de-DE"), icon: "📅" },
            { label: "Level", value: String(user.level), icon: "⭐" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="app-card p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{icon}</span>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
              <div className="font-bold text-foreground">{value}</div>
            </div>
          ))}
        </div>

        {/* Quick links row */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/shop"
            className="app-card p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg shrink-0">🏪</div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">Shop</p>
              <p className="text-xs text-muted-foreground">{user.coins} Coins</p>
            </div>
            <Coins className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 transition-colors ml-auto shrink-0" />
          </Link>
          <Link
            href="/achievements"
            className="app-card p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center text-lg shrink-0">🏆</div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">Achievements</p>
              <p className="text-xs text-muted-foreground">Fortschritte</p>
            </div>
            <Trophy className="w-4 h-4 text-muted-foreground group-hover:text-yellow-500 transition-colors ml-auto shrink-0" />
          </Link>
        </div>

        {/* Public profile link */}
        <Link
          href={`/u/${user.username}`}
          className="app-card p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-lg shrink-0">👤</div>
            <div>
              <p className="font-semibold text-sm text-foreground">Öffentliches Profil</p>
              <p className="text-xs text-muted-foreground">So sehen andere dein Profil</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
