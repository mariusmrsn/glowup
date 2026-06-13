import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCharacter } from "@/server/queries/character";
import { TopBar } from "@/components/layout/TopBar";
import { LevelBadge } from "@/components/game/LevelBadge";
import { RankBadge } from "@/components/game/RankBadge";
import { getXpProgressInCurrentLevel } from "@/lib/xp";
import { ProfileEditClient } from "./ProfileEditClient";
import { ProfileStatsClient } from "./ProfileStatsClient";
import { createAdminClient } from "@/lib/supabase/server";
import { Coins, ExternalLink, Trophy } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const memberSince = new Date(user.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      <TopBar title="Profil" user={user} />
      <div className="p-4 lg:p-6 max-w-xl mx-auto space-y-5">

        {/* Character card */}
        <div className="app-card p-6 text-center relative overflow-hidden">
          {/* Glow blobs */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-violet-500/8 blur-3xl rounded-full pointer-events-none" />

          {/* Badges row */}
          {badges.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 mb-3 relative">
              {badges.slice(0, 5).map((b) => (
                <span
                  key={b.item_id}
                  title={b.shop_items.name}
                  className="text-xl w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/8"
                >
                  {b.shop_items.icon}
                </span>
              ))}
            </div>
          )}

          {/* Avatar */}
          <div className="relative inline-block mb-3">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 blur-xl scale-125 pointer-events-none" />
            <Avatar className="w-20 h-20 ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-background relative">
              <AvatarImage src={user.avatar_url ?? ""} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-2xl font-black text-indigo-300">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <h2 className="text-2xl font-black text-foreground relative">{user.username}</h2>

          {titleItem ? (
            <p className="text-sm font-semibold mt-0.5 relative" style={{ color: RARITY_COLOR[titleItem.shop_items.rarity] }}>
              {titleItem.shop_items.icon} {titleItem.shop_items.name}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5 relative">{user.title}</p>
          )}

          <div className="flex items-center justify-center gap-3 mt-3 mb-4 relative">
            <LevelBadge level={user.level} />
            <RankBadge rank={user.rank} />
          </div>

          <div className="border-t border-border pt-4 mt-2 relative">
            <ProfileEditClient user={extUser} />
          </div>
        </div>

        {/* Animated stats: XP ring + stat cards */}
        <ProfileStatsClient
          totalXp={Number(user.total_xp)}
          coins={Number(user.coins)}
          currentStreak={user.current_streak}
          longestStreak={user.longest_streak}
          memberSince={memberSince}
          level={user.level}
          xpCurrent={xpProgress.current}
          xpRequired={xpProgress.required}
          xpPct={xpProgress.percentage}
        />

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
