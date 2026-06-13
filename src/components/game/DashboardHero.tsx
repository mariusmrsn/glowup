"use client";

import { useEffect, useState } from "react";
import { Flame, Zap } from "lucide-react";

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function XpRing({ pct }: { pct: number }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (pct / 100) * circ), 120);
    return () => clearTimeout(t);
  }, [pct, circ]);

  return (
    <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
      <defs>
        <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
      <circle
        cx="56" cy="56" r={r} fill="none"
        stroke="url(#xpGrad)" strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

interface DashboardHeroProps {
  username: string;
  level: number;
  rank: string;
  totalXp: number;
  xpCurrent: number;
  xpRequired: number;
  xpPct: number;
  streak: number;
  coins: number;
  greeting: string;
}

export function DashboardHero({
  username, level, rank, totalXp, xpCurrent, xpRequired, xpPct, streak, coins, greeting,
}: DashboardHeroProps) {
  const animatedXp = useCountUp(totalXp, 1400);
  const animatedStreak = useCountUp(streak, 700);
  const animatedCoins = useCountUp(coins, 900);

  return (
    <div className="app-card p-5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20 overflow-hidden relative">
      {/* Glow blob */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-center gap-4">
        {/* XP Ring */}
        <div className="relative shrink-0">
          <XpRing pct={xpPct} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground leading-none mb-0.5">Lv.</span>
            <span className="text-3xl font-black text-foreground leading-none">{level}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{greeting},</p>
          <h1 className="text-xl font-bold text-foreground truncate">{username} 👋</h1>
          <p className="text-xs text-muted-foreground/60 mb-3">{rank}</p>

          <div className="flex flex-wrap gap-2">
            {streak > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-semibold">
                <Flame className="w-3 h-3" /> {animatedStreak} {animatedStreak === 1 ? "Tag" : "Tage"}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-semibold">
              <Zap className="w-3 h-3" /> {animatedXp.toLocaleString()} XP
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-semibold">
              🪙 {animatedCoins.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
          <span>{xpCurrent.toLocaleString()} / {xpRequired.toLocaleString()} XP</span>
          <span>{xpPct}% zum nächsten Level</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${xpPct}%`, background: "linear-gradient(90deg, #6366f1, #a855f7)" }}
          />
        </div>
      </div>
    </div>
  );
}
