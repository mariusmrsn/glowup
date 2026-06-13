"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { HabitCard } from "@/components/game/HabitCard";
import { CreateHabitDialog } from "@/components/game/CreateHabitDialog";
import type { Habit } from "@/types";

const SYNONYMS: Record<string, string[]> = {
  fahrrad: ["fahrrad fahren", "cycling", "radfahren", "bike"],
  laufen: ["laufen", "joggen", "rennen", "sprint", "running"],
  schwimmen: ["schwimmen", "swimming", "pool"],
  sport: ["sport", "training", "workout", "fitness", "gym"],
  wasser: ["wasser trinken", "hydration", "trinken"],
  lesen: ["lesen", "buch", "reading"],
  schlafen: ["schlafen", "schlaf", "sleep", "ausschlafen"],
  mediation: ["meditation", "meditieren", "mindfulness"],
  lernen: ["lernen", "studieren", "üben", "hausaufgaben"],
  sparen: ["sparen", "geld", "finanzen", "budget"],
  aufräumen: ["aufräumen", "ordnung", "putzen", "zimmer"],
  pushups: ["push-ups", "liegestütze", "krafttraining"],
  yoga: ["yoga", "dehnen", "stretching", "flexibilität"],
  vitamin: ["vitamine", "supplemente", "nahrungsergänzung"],
  kochen: ["kochen", "essen", "ernährung", "mahlzeit"],
  schreiben: ["schreiben", "journal", "tagebuch", "notizen"],
};

function searchMatch(query: string, habit: Habit): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const text = `${habit.name} ${habit.description ?? ""}`.toLowerCase();
  if (text.includes(q)) return true;
  for (const [keyword, expansions] of Object.entries(SYNONYMS)) {
    if (q.includes(keyword) || keyword.includes(q)) {
      if (expansions.some((e) => text.includes(e)) || text.includes(keyword)) return true;
    }
  }
  return false;
}

interface Props {
  habits: Habit[];
  completedIds: string[];
}

export function HabitsClient({ habits, completedIds }: Props) {
  const [query, setQuery] = useState("");
  const completedSet = new Set(completedIds);

  const filtered = habits.filter((h) => searchMatch(query, h));

  const completedToday = habits.filter((h) => completedSet.has(h.id));

  return (
    <div>
      {/* Stats + action row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {completedToday.length}/{habits.length} heute erledigt
        </p>
        <CreateHabitDialog />
      </div>

      {/* Search */}
      {habits.length > 0 && (
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gewohnheiten suchen…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
          />
        </div>
      )}

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="font-semibold text-foreground mb-1">Starte deinen ersten Habit</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Kleine tägliche Gewohnheiten führen zu großen Veränderungen.
          </p>
          <CreateHabitDialog />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">Keine Gewohnheit gefunden für „{query}"</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((habit, i) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completedToday={completedSet.has(habit.id)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
