"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Swords,
  Zap,
  Trophy,
  BarChart3,
  User,
  LogOut,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import type { User as UserType } from "@/types";
import { getXpProgressInCurrentLevel } from "@/lib/xp";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/habits", icon: CheckSquare, label: "Gewohnheiten" },
  { href: "/quests", icon: Swords, label: "Quests" },
  { href: "/attributes", icon: Zap, label: "Attribute" },
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

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen fixed left-0 top-0 border-r border-border bg-sidebar z-30">
      {/* Logo */}
      <div className="h-14 px-5 flex items-center border-b border-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            G
          </div>
          <span className="font-semibold text-base text-foreground">GlowUp</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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

      {/* User info + logout */}
      {user && (
        <div className="px-3 py-3 border-t border-border shrink-0 space-y-1">
          {/* XP progress */}
          {xpProgress && (
            <div className="px-3 py-2 mb-1">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                <span className="font-medium text-foreground">Lv. {user.level}</span>
                <span>{xpProgress.current}/{xpProgress.required} XP</span>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${xpProgress.percentage}%` }}
                />
              </div>
              {user.current_streak > 0 && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="text-[11px] text-orange-400">{user.current_streak} Tage</span>
                </div>
              )}
            </div>
          )}

          {/* User row */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-secondary">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-indigo-400">
                {user.username.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user.username}</p>
              <p className="text-[10px] text-muted-foreground">{user.rank} · {user.coins} Coins</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Abmelden
          </button>
        </div>
      )}
    </aside>
  );
}
