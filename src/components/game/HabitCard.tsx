"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Timer, X, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Habit } from "@/types";
import { ATTRIBUTE_META } from "@/types";
import { completeHabit } from "@/server/actions/habits";
import { useGameStore } from "@/stores/gameStore";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit & { duration_minutes?: number };
  completedToday: boolean;
  index?: number;
}

function ActivityTimer({
  habit,
  onComplete,
  onCancel,
}: {
  habit: HabitCardProps["habit"];
  onComplete: () => void;
  onCancel: () => void;
}) {
  const totalSeconds = (habit.duration_minutes ?? 1) * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!running || finished) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { setFinished(true); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, finished]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = ((totalSeconds - remaining) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 44;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="app-card max-w-sm w-full mx-4 p-6 text-center"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-indigo-500" />
            <p className="font-bold text-sm text-foreground">{habit.name}</p>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Circular progress */}
        <div className="relative w-36 h-36 mx-auto mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="7" fill="none" className="text-border" />
            <circle
              cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="7" fill="none"
              className={finished ? "text-emerald-500" : "text-indigo-500"}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black tabular-nums text-foreground">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {finished ? "Fertig! 🎉" : running ? "Läuft…" : "Bereit"}
            </span>
          </div>
        </div>

        {finished ? (
          <button
            onClick={onComplete}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            ✓ Bestätigen & {habit.xp_reward} XP kassieren
          </button>
        ) : (
          <button
            onClick={() => setRunning((r) => !r)}
            className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Timer starten</>}
          </button>
        )}

        <p className="text-[11px] text-muted-foreground mt-3">
          Ziel: {habit.duration_minutes} Min · Bleib dabei für deine XP!
        </p>
      </motion.div>
    </div>
  );
}

export function HabitCard({ habit, completedToday, index = 0 }: HabitCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localCompleted, setLocalCompleted] = useState(completedToday);
  const [showTimer, setShowTimer] = useState(false);
  const { addXpPopup, showLevelUp, queueAchievement } = useGameStore();
  const meta = ATTRIBUTE_META[habit.attribute_type];
  const hasDuration = (habit.duration_minutes ?? 0) > 0;

  const doComplete = () => {
    if (localCompleted || isPending) return;
    setLocalCompleted(true);
    setShowTimer(false);

    startTransition(async () => {
      try {
        const result = await completeHabit(habit.id);
        if (result.alreadyCompleted) return;
        addXpPopup({ id: nanoid(), amount: result.xpEarned });
        if (result.leveledUp) showLevelUp({ oldLevel: result.oldLevel, newLevel: result.newLevel, rank: result.newRank });
        result.achievementsUnlocked.forEach((a) => queueAchievement(a));
        toast.success(`+${result.xpEarned} XP`, { description: `"${habit.name}" abgeschlossen!` });
        router.refresh();
      } catch {
        setLocalCompleted(false);
        toast.error("Fehler beim Abschließen");
      }
    });
  };

  const handleClick = () => {
    if (localCompleted || isPending) return;
    if (hasDuration) setShowTimer(true);
    else doComplete();
  };

  return (
    <>
      <div
        className={cn(
          "app-card p-4 flex items-center gap-4 transition-opacity",
          "animate-in fade-in slide-in-from-left-2 duration-200",
          localCompleted && "opacity-50"
        )}
        style={{ animationDelay: `${index * 40}ms` }}
      >
        <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className={cn("font-medium text-sm", localCompleted ? "line-through text-muted-foreground" : "text-foreground")}>
              {habit.name}
            </h3>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ color: meta.color, backgroundColor: `${meta.color}15` }}
            >
              {meta.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span>+{habit.xp_reward} XP</span>
            {hasDuration && (
              <span className="flex items-center gap-0.5 text-indigo-500/70">
                <Timer className="w-3 h-3" />
                {habit.duration_minutes} Min Timer
              </span>
            )}
            {habit.description ? <span>· {habit.description}</span> : null}
          </p>
        </div>

        <button
          onClick={handleClick}
          disabled={localCompleted || isPending}
          aria-label={localCompleted ? "Erledigt" : hasDuration ? "Timer starten" : "Abschließen"}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer border",
            localCompleted
              ? "bg-indigo-500 border-indigo-500 text-white"
              : "border-border text-muted-foreground hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10",
            isPending && "opacity-60 cursor-not-allowed"
          )}
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : hasDuration && !localCompleted ? <Timer className="w-3.5 h-3.5" />
            : <Check className="w-3.5 h-3.5" />}
        </button>
      </div>

      <AnimatePresence>
        {showTimer && (
          <ActivityTimer key="timer" habit={habit} onComplete={doComplete} onCancel={() => setShowTimer(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
