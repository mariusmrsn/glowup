"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  CheckSquare,
  Swords,
  Trophy,
  BarChart3,
  User,
  Flame,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import type { User as UserType } from "@/types";
import { getXpProgressInCurrentLevel } from "@/lib/xp";
import { RANK_COLORS } from "@/lib/ranks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/attributes", icon: Zap, label: "Attribute" },
  { href: "/habits", icon: CheckSquare, label: "Gewohnheiten" },
  { href: "/quests", icon: Swords, label: "Quests" },
  { href: "/achievements", icon: Trophy, label: "Achievements" },
  { href: "/stats", icon: BarChart3, label: "Statistiken" },
  { href: "/profile", icon: User, label: "Profil" },
] as const;

interface SidebarProps {
  user: UserType | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const xpProgress = user
    ? getXpProgressInCurrentLevel(Number(user.total_xp))
    : null;
  const rankColor = user ? RANK_COLORS[user.rank] : "#94a3b8";

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-white/5 bg-sidebar z-30">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
            G
          </div>
          <span className="font-bold text-lg gradient-text">GlowUp</span>
        </Link>
      </div>

      {/* Character Panel */}
      {user && (
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10 ring-2 ring-offset-2 ring-offset-sidebar" style={{ "--tw-ring-color": rankColor } as React.CSSProperties}>
              <AvatarImage src={user.avatar_url ?? ""} alt={user.username} />
              <AvatarFallback className="bg-indigo-500/20 text-indigo-300 text-sm font-bold">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.username}
              </p>
              <p className="text-xs text-muted-foreground" style={{ color: rankColor }}>
                {user.rank}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">
              <span className="text-xs font-bold text-indigo-400">
                Lv.{user.level}
              </span>
            </div>
          </div>

          {/* XP Bar */}
          {xpProgress && (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>XP</span>
                <span>
                  {xpProgress.current.toLocaleString()} /{" "}
                  {xpProgress.required.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${xpProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Streak */}
          {user.current_streak > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-medium text-orange-400">
                {user.current_streak} Tage Streak
              </span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                    isActive
                      ? "bg-indigo-500/15 text-indigo-300 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Coins + Logout */}
      <div className="p-4 border-t border-white/5">
        {user && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-amber-400/20 flex items-center justify-center">
                <span className="text-[10px]">💰</span>
              </div>
              <span className="text-sm font-medium text-amber-400">
                {user.coins.toLocaleString()}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Coins</span>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
