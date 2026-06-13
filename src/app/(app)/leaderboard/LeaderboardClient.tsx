"use client";

import { useState, useTransition, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, UserCheck, Clock, UserX, Flame, Zap, Search, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sendFollowRequest, cancelFollowRequest, unfollowUser, searchUsers } from "@/server/actions/social";
import type { LeaderboardUser } from "@/server/queries/leaderboard";
import { toast } from "sonner";

const RANK_COLORS: Record<string, string> = {
  Legend: "#F59E0B",
  Master: "#8B5CF6",
  Diamond: "#3B82F6",
  Platinum: "#06B6D4",
  Gold: "#F59E0B",
  Silver: "#94a3b8",
  Bronze: "#d97706",
  Beginner: "#6b7280",
};

function getMedal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

function FollowButton({
  user,
  onUpdate,
}: {
  user: LeaderboardUser;
  onUpdate: (id: string, patch: Partial<LeaderboardUser>) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        if (user.is_following) {
          await unfollowUser(user.id);
          onUpdate(user.id, { is_following: false });
          toast.success(`${user.username} entfolgt`);
        } else if (user.has_pending_request) {
          await cancelFollowRequest(user.id);
          onUpdate(user.id, { has_pending_request: false });
          toast.success("Anfrage zurückgezogen");
        } else {
          await sendFollowRequest(user.id);
          onUpdate(user.id, { has_pending_request: true });
          toast.success(`Anfrage an ${user.username} gesendet`);
        }
      } catch {
        toast.error("Fehler");
      }
    });
  };

  const state = user.is_following ? "following" : user.has_pending_request ? "pending" : "none";

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer disabled:opacity-50 ${
        state === "following"
          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-red-500/10 hover:text-red-500"
          : state === "pending"
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-red-500/10 hover:text-red-500"
          : "bg-secondary hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-muted-foreground"
      }`}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : state === "following" ? (
        <><UserCheck className="w-3.5 h-3.5" /> Gefolgt</>
      ) : state === "pending" ? (
        <><Clock className="w-3.5 h-3.5" /> Ausstehend</>
      ) : (
        <><UserPlus className="w-3.5 h-3.5" /> Folgen</>
      )}
    </button>
  );
}

function UserSearchPanel({
  onUpdate,
}: {
  onUpdate: (id: string, patch: Partial<LeaderboardUser>) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LeaderboardUser[]>([]);
  const [isSearching, startSearch] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(() => {
      startSearch(async () => {
        const found = await searchUsers(value);
        setResults(found);
      });
    }, 300);
  };

  const handleUpdate = (id: string, patch: Partial<LeaderboardUser>) => {
    setResults((prev) => prev.map((u) => u.id === id ? { ...u, ...patch } : u));
    onUpdate(id, patch);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Nutzer nach Benutzernamen suchen..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500/50 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {(isSearching || results.length > 0 || (query && !isSearching)) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 rounded-xl border border-border bg-background/95 backdrop-blur-sm overflow-hidden"
          >
            {isSearching ? (
              <div className="flex items-center justify-center gap-2 py-5 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Suche...
              </div>
            ) : results.length === 0 ? (
              <p className="text-center py-5 text-sm text-muted-foreground">
                Kein Nutzer mit &ldquo;{query}&rdquo; gefunden
              </p>
            ) : (
              <div className="divide-y divide-border">
                {results.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 px-3 py-2.5">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={user.avatar_url ?? ""} />
                      <AvatarFallback className="bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link href={`/u/${user.username}`} className="font-medium text-sm text-foreground truncate hover:text-indigo-500 transition-colors">
                        {user.username}
                      </Link>
                      <p className="text-[10px] text-muted-foreground">
                        Lv. {user.level} · {Number(user.total_xp).toLocaleString()} XP
                      </p>
                    </div>
                    <FollowButton user={user} onUpdate={handleUpdate} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Podium({ users }: { users: LeaderboardUser[] }) {
  if (users.length < 3) return null;
  const [first, second, third] = [users[0]!, users[1]!, users[2]!];
  const rankColor = (r: string) => RANK_COLORS[r] ?? "#6b7280";

  const PodiumSlot = ({
    user, place, height, delay,
  }: { user: LeaderboardUser; place: 1 | 2 | 3; height: string; delay: number }) => {
    const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
    const colors = { 1: "#F59E0B", 2: "#94a3b8", 3: "#d97706" };
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-2 flex-1"
      >
        <Link href={`/u/${user.username}`} className="flex flex-col items-center gap-1 group">
          <Avatar className="w-12 h-12 ring-2 ring-offset-2 ring-offset-background transition-transform group-hover:scale-105"
            style={{ ringColor: colors[place] } as React.CSSProperties}>
            <AvatarImage src={user.avatar_url ?? ""} />
            <AvatarFallback className="text-sm font-black" style={{ background: `${colors[place]}20`, color: colors[place] }}>
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xl -mt-1">{medals[place]}</span>
          <p className="text-xs font-semibold text-foreground text-center truncate max-w-[70px]">{user.username}</p>
          <p className="text-[10px] font-medium" style={{ color: rankColor(user.rank) }}>Lv. {user.level}</p>
          <p className="text-[10px] text-muted-foreground">{Number(user.total_xp).toLocaleString()} XP</p>
        </Link>
        <div
          className="w-full rounded-t-xl flex items-center justify-center text-white/40 font-black text-lg"
          style={{ height, background: `linear-gradient(180deg, ${colors[place]}30, ${colors[place]}10)`, border: `1px solid ${colors[place]}30`, borderBottom: "none" }}
        >
          {place}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex items-end gap-2 mb-2">
      <PodiumSlot user={second} place={2} height="56px" delay={0.1} />
      <PodiumSlot user={first} place={1} height="80px" delay={0} />
      <PodiumSlot user={third} place={3} height="40px" delay={0.2} />
    </div>
  );
}

export function LeaderboardClient({ users: initialUsers }: { users: LeaderboardUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState<"all" | "following">("all");

  const displayed = filter === "following" ? users.filter((u) => u.is_following) : users;

  const handleUpdate = (id: string, patch: Partial<LeaderboardUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  return (
    <div className="space-y-4">
      {/* User search */}
      <UserSearchPanel onUpdate={handleUpdate} />

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary w-fit">
        {(["all", "following"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filter === f
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "🌍 Global" : "👥 Freunde"}
          </button>
        ))}
      </div>

      {/* Podium — only in global view with enough players */}
      {filter === "all" && users.length >= 3 && <Podium users={users.slice(0, 3)} />}

      {/* Empty state */}
      {displayed.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">{filter === "following" ? "👥" : "🌍"}</div>
          <p className="text-sm font-medium text-foreground mb-1">
            {filter === "following" ? "Noch keine Freunde" : "Keine öffentlichen Spieler"}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {filter === "following"
              ? "Suche oben nach Benutzernamen und schick eine Anfrage — dann siehst du hier, wie deine Freunde abschneiden."
              : "Noch niemand mit öffentlichem Profil gefunden."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((user, i) => {
            const globalRank = users.findIndex((u) => u.id === user.id) + 1;
            const medal = getMedal(globalRank);
            const rankColor = RANK_COLORS[user.rank] ?? "#6b7280";

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`app-card p-3 flex items-center gap-3 ${
                  globalRank <= 3 ? "border-amber-400/20" : ""
                }`}
              >
                <div className="w-8 text-center shrink-0">
                  {medal ? (
                    <span className="text-xl">{medal}</span>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">#{globalRank}</span>
                  )}
                </div>

                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={user.avatar_url ?? ""} />
                  <AvatarFallback className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <Link href={`/u/${user.username}`} className="font-semibold text-sm text-foreground truncate hover:text-indigo-500 transition-colors">
                    {user.username}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium" style={{ color: rankColor }}>
                      Lv. {user.level}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5" />
                      {Number(user.total_xp).toLocaleString()} XP
                    </span>
                    {user.current_streak > 0 && (
                      <span className="text-[10px] text-orange-500 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        {user.current_streak}
                      </span>
                    )}
                  </div>
                </div>

                <FollowButton user={user} onUpdate={handleUpdate} />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
