"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ProfileStatsClientProps {
  totalXp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  memberSince: string;
  level: number;
  xpCurrent: number;
  xpRequired: number;
  xpPct: number;
}

function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

function XpRing({ pct, xpCurrent, xpRequired }: { pct: number; xpCurrent: number; xpRequired: number }) {
  const R = 44;
  const C = 2 * Math.PI * R;
  const [offset, setOffset] = useState(C);
  const count = useCountUp(xpCurrent);

  useEffect(() => {
    const t = setTimeout(() => setOffset(C * (1 - pct / 100)), 120);
    return () => clearTimeout(t);
  }, [C, pct]);

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg width="96" height="96" className="absolute inset-0 rotate-[-90deg]">
        <defs>
          <linearGradient id="pgRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r={R} fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="7" />
        <circle
          cx="48" cy="48" r={R} fill="none"
          stroke="url(#pgRingGrad)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-sm font-black text-foreground leading-none tabular-nums">
          {count.toLocaleString()}
        </span>
        <span className="text-[9px] text-muted-foreground leading-none">/ {xpRequired.toLocaleString()}</span>
        <span className="text-[9px] text-indigo-400 font-semibold leading-none mt-0.5">XP</span>
      </div>
    </div>
  );
}

export function ProfileStatsClient({
  totalXp, coins, currentStreak, longestStreak, memberSince, level, xpCurrent, xpRequired, xpPct,
}: ProfileStatsClientProps) {
  const xpCount = useCountUp(totalXp);
  const coinsCount = useCountUp(coins);
  const streakCount = useCountUp(currentStreak);

  const stats = [
    { label: "Gesamt XP", value: xpCount.toLocaleString(), icon: "⚡", color: "#6366f1" },
    { label: "Coins", value: coinsCount.toLocaleString(), icon: "🪙", color: "#F59E0B" },
    { label: "Streak", value: `${streakCount} 🔥`, icon: "🔥", color: "#f97316" },
    { label: "Bester Streak", value: `${longestStreak} Tage`, icon: "🏆", color: "#eab308" },
    { label: "Dabei seit", value: memberSince, icon: "📅", color: "#10b981" },
    { label: "Level", value: String(level), icon: "⭐", color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-4">
      {/* XP Progress panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="app-card p-5 flex items-center gap-5 relative overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-indigo-500/8 blur-3xl rounded-full pointer-events-none" />
        <XpRing pct={xpPct} xpCurrent={xpCurrent} xpRequired={xpRequired} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">XP zum nächsten Level</p>
          <p className="text-2xl font-black text-foreground tabular-nums">{xpCount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Gesamt XP</p>
          <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${xpPct}%`,
                background: "linear-gradient(90deg, #6366f1, #a855f7)",
                transition: "width 1.3s cubic-bezier(0.34,1.56,0.64,1) 0.1s",
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{Math.round(xpPct)}% des Levels</p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.055 }}
            className="app-card p-4 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 rounded-xl opacity-[0.07]"
              style={{ background: `radial-gradient(circle at 0% 60%, ${color}, transparent 70%)` }}
            />
            <div className="relative flex items-center gap-1.5 mb-1">
              <span className="text-sm">{icon}</span>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
            <p className="relative font-black text-lg text-foreground tabular-nums">{value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
