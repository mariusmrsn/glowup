"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  Target,
  ListTodo,
  ShoppingBag,
  Users,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import type { User as UserType } from "@/types";
import { getXpProgressInCurrentLevel } from "@/lib/xp";

// Each nav item has its own accent color — no uniform purple
const NAV_ITEMS = [
  { href: "/dashboard",       icon: LayoutDashboard, label: "Dashboard",          color: "#6366f1" },
  { href: "/habits",          icon: CheckSquare,     label: "Gewohnheiten",       color: "#10B981" },
  { href: "/goals",           icon: Target,          label: "Ziele",              color: "#F59E0B" },
  { href: "/todo",            icon: ListTodo,        label: "To-Do Liste",        color: "#3B82F6" },
  { href: "/quests",          icon: Swords,          label: "Quests",             color: "#EF4444" },
  { href: "/leaderboard",     icon: Users,           label: "Rangliste",          color: "#EC4899" },
  { href: "/attributes",      icon: Zap,             label: "Attribute",          color: "#8B5CF6" },
  { href: "/achievements",    icon: Trophy,          label: "Achievements",       color: "#F59E0B" },
  { href: "/shop",            icon: ShoppingBag,     label: "Shop",               color: "#F97316" },
  { href: "/stats",           icon: BarChart3,       label: "Statistiken",        color: "#06B6D4" },
  { href: "/profile",         icon: User,            label: "Profil",             color: "#94a3b8" },
] as const;

interface SidebarProps {
  user: UserType | null;
  unreadCount?: number;
  isAdmin?: boolean;
}

function NavItem({ href, icon: Icon, label, color, badge }: { href: string; icon: React.ElementType; label: string; color: string; badge?: number }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
  const [hovered, setHovered] = useState(false);

  return (
    <li>
      <Link
        href={href as never}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
        style={{
          color: isActive || hovered ? color : undefined,
          backgroundColor: isActive ? `${color}15` : hovered ? `${color}0d` : undefined,
          fontWeight: isActive ? 500 : 400,
        }}
      >
        <Icon className="w-4 h-4 shrink-0" style={{ color: isActive || hovered ? color : undefined }} />
        <span className={cn("flex-1 transition-colors", !isActive && !hovered && "text-muted-foreground")}>
          {label}
        </span>
        {badge && badge > 0 ? (
          <span
            className="ml-auto min-w-[18px] h-[18px] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1"
            style={{ backgroundColor: color }}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        ) : isActive ? (
          <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        ) : null}
      </Link>
    </li>
  );
}

export function Sidebar({ user, unreadCount = 0, isAdmin = false }: SidebarProps) {
  const xpProgress = user ? getXpProgressInCurrentLevel(Number(user.total_xp)) : null;

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen fixed left-0 top-0 border-r border-border bg-sidebar z-30">
      {/* Logo */}
      <div className="h-14 px-5 flex items-center border-b border-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="GlowUp" width={28} height={28} className="shrink-0" />
          <span className="font-bold text-base text-foreground tracking-tight">GlowUp</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => <NavItem key={item.href} {...item} />)}
          {/* Notifications — always visible, badge shows unread count */}
          <NavItem
            href="/notifications"
            icon={Bell}
            label={isAdmin ? "Benachrichtigungen ⚡" : "Benachrichtigungen"}
            color="#F59E0B"
            badge={unreadCount}
          />
        </ul>
      </nav>

      {/* User info + logout */}
      {user && (
        <div className="px-3 py-3 border-t border-border shrink-0 space-y-1">
          {xpProgress && (
            <div className="px-3 py-2 mb-1">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                <span className="font-medium text-foreground">Lv. {user.level}</span>
                <span>{xpProgress.current}/{xpProgress.required} XP</span>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress.percentage}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
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

          <Link
            href="/profile"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors group"
          >
            <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden bg-indigo-500/20 flex items-center justify-center">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-indigo-500">
                  {user.username.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate group-hover:text-indigo-500 transition-colors">{user.username}</p>
              <p className="text-[10px] text-muted-foreground">{user.rank} · {user.coins} 🪙</p>
            </div>
          </Link>

          <div className="flex items-center justify-between px-1 pt-1">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Abmelden"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
