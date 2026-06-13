import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LevelBadge } from "@/components/game/LevelBadge";
import { RankBadge } from "@/components/game/RankBadge";
import { XPBar } from "@/components/game/XPBar";
import { getXpProgressInCurrentLevel } from "@/lib/xp";
import { getPublicProfile } from "@/server/queries/profiles";
import { ATTRIBUTE_META } from "@/types";
import { FollowButtonPublic } from "./FollowButtonPublic";

const ATTR_EMOJIS: Record<string, string> = {
  strength: "💪", intelligence: "🧠", economy: "💰", discipline: "🎯", social: "🤝", health: "❤️",
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await getPublicProfile(username, session.user.id);
  if (!profile) notFound();

  const { user, attributes, achievements, isFollowing } = profile;
  const xpProgress = getXpProgressInCurrentLevel(Number(user.total_xp));
  const isOwnProfile = user.username.toLowerCase() === (session.user as { username?: string }).username?.toLowerCase();

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/leaderboard"
          className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Profil</h1>
      </div>

      {/* Profile card */}
      <div className="app-card p-6 text-center">
        <Avatar className="w-24 h-24 mx-auto ring-4 ring-indigo-500/20 ring-offset-2 ring-offset-background mb-4">
          <AvatarImage src={user.avatar_url ?? ""} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-600 dark:text-indigo-400 text-3xl font-black">
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h2 className="text-2xl font-black text-foreground">{user.username}</h2>
        {user.bio && <p className="text-sm text-muted-foreground italic mt-1">„{user.bio}"</p>}

        <div className="flex items-center justify-center gap-3 mt-3 mb-4">
          <LevelBadge level={user.level} />
          <RankBadge rank={user.rank} />
        </div>

        <div className="max-w-xs mx-auto mb-4">
          <XPBar current={xpProgress.current} required={xpProgress.required} percentage={xpProgress.percentage} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div className="app-card p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Streak</p>
            <p className="font-bold text-foreground">🔥 {user.current_streak}</p>
          </div>
          <div className="app-card p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Bester</p>
            <p className="font-bold text-foreground">🏆 {user.longest_streak}</p>
          </div>
          <div className="app-card p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Achievements</p>
            <p className="font-bold text-foreground">{achievements.length}</p>
          </div>
        </div>

        {!isOwnProfile && (
          <FollowButtonPublic targetId={user.id} initialFollowing={isFollowing} username={user.username} />
        )}
        {isOwnProfile && (
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
          >
            Mein Profil bearbeiten
          </Link>
        )}
      </div>

      {/* Attributes */}
      <div className="app-card p-4">
        <h3 className="font-bold text-sm text-foreground mb-3">Attribute</h3>
        <div className="grid grid-cols-2 gap-3">
          {attributes.map((attr) => {
            const meta = ATTRIBUTE_META[attr.type];
            const emoji = ATTR_EMOJIS[attr.type] ?? "⭐";
            return (
              <div
                key={attr.type}
                className="rounded-xl p-3 border"
                style={{ borderColor: `${meta.color}25`, background: `${meta.color}08` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{meta.label}</p>
                    <p className="text-[10px] text-muted-foreground">Lv. {attr.level}</p>
                  </div>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((Number(attr.xp) / Math.max(Number(attr.total_xp), 1)) * 100, 100)}%`,
                      background: meta.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="app-card p-4">
          <h3 className="font-bold text-sm text-foreground mb-3">
            Achievements <span className="text-muted-foreground font-normal">({achievements.length})</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                title={ach.description}
                className="flex items-center gap-2 rounded-xl bg-secondary p-2.5"
              >
                <span className="text-xl shrink-0">{ach.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{ach.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
