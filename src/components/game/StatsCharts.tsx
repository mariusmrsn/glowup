"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { ATTRIBUTE_META } from "@/types";
import type { AttributeType, User } from "@/types";

interface StatsChartsProps {
  user: User | null;
  completionHistory: { date: string; count: number; label: string }[];
  radarData: { type: AttributeType; level: number; xp: number }[];
}

export function StatsCharts({
  user,
  completionHistory,
  radarData,
}: StatsChartsProps) {
  const radarFormatted = radarData.map((d) => ({
    subject: ATTRIBUTE_META[d.type].label,
    level: d.level,
    fullMark: 100,
  }));

  const totalCompletions = completionHistory.reduce((s, d) => s + d.count, 0);
  const avgPerDay = totalCompletions / 30;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {user && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Level", value: user.level, suffix: "" },
            { label: "Gesamt XP", value: Number(user.total_xp).toLocaleString(), suffix: "" },
            { label: "Beste Streak", value: user.longest_streak, suffix: " Tage" },
            { label: "Ø Habits/Tag", value: avgPerDay.toFixed(1), suffix: "" },
          ].map(({ label, value, suffix }) => (
            <div key={label} className="glass-card rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-foreground">
                {value}{suffix}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Habits per day bar chart */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-4 text-sm">
          Abgeschlossene Gewohnheiten — letzte 30 Tage
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={completionHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#64748b" }}
              interval={6}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#f8fafc",
              }}
              cursor={{ fill: "rgba(99,102,241,0.1)" }}
            />
            <Bar
              dataKey="count"
              name="Habits"
              fill="#6366f1"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attribute Radar */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-4 text-sm">
          Attribut-Übersicht
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarFormatted}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <Radar
              name="Level"
              dataKey="level"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#f8fafc",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
