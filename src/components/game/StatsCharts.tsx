"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell,
} from "recharts";
import { ATTRIBUTE_META } from "@/types";
import type { AttributeType, User } from "@/types";
import { motion } from "framer-motion";

interface StatsChartsProps {
  user: User | null;
  completionHistory: { date: string; count: number; label: string }[];
  radarData: { type: AttributeType; level: number; xp: number }[];
}

const TOOLTIP_STYLE = {
  background: "rgba(10,10,20,0.95)",
  border: "1px solid rgba(99,102,241,0.25)",
  borderRadius: "10px",
  fontSize: "12px",
  color: "#f1f5f9",
  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
};

export function StatsCharts({ user, completionHistory, radarData }: StatsChartsProps) {
  const radarFormatted = radarData.map((d) => ({
    subject: ATTRIBUTE_META[d.type].label,
    emoji: ATTRIBUTE_META[d.type].emoji ?? "",
    level: d.level,
    fullMark: 100,
  }));

  const totalCompletions = completionHistory.reduce((s, d) => s + d.count, 0);
  const avgPerDay = totalCompletions / 30;
  const maxCount = Math.max(...completionHistory.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {user && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Level", value: String(user.level), icon: "⚡", color: "#6366f1" },
            { label: "Gesamt XP", value: Number(user.total_xp).toLocaleString(), icon: "✨", color: "#8b5cf6" },
            { label: "Beste Streak", value: `${user.longest_streak}d`, icon: "🔥", color: "#f97316" },
            { label: "Ø Habits/Tag", value: avgPerDay.toFixed(1), icon: "📈", color: "#10b981" },
          ].map(({ label, value, icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card rounded-2xl p-4 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10 rounded-2xl" style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }} />
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-xl font-black text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Habits bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground text-sm">Gewohnheiten — letzte 30 Tage</h3>
          <span className="text-xs text-muted-foreground bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full font-medium">
            {totalCompletions} gesamt
          </span>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={completionHistory} margin={{ top: 4, right: 0, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} interval={6} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
            <Bar dataKey="count" name="Habits" radius={[4, 4, 0, 0]}>
              {completionHistory.map((entry, i) => (
                <Cell key={i} fill={entry.count === maxCount ? "#a855f7" : "url(#barGrad)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Radar chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-card rounded-2xl p-5"
      >
        <h3 className="font-semibold text-foreground text-sm mb-1">Attribut-Radar</h3>
        <p className="text-xs text-muted-foreground mb-4">Deine Stärken auf einen Blick</p>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarFormatted} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <defs>
              <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <PolarGrid stroke="rgba(255,255,255,0.07)" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Radar name="Level" dataKey="level" stroke="#8b5cf6" fill="url(#radarGrad)" strokeWidth={2} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
