"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Habit } from "@/types";
import { ATTRIBUTE_META } from "@/types";
import { completeHabit } from "@/server/actions/habits";
import { useGameStore } from "@/stores/gameStore";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  completedToday: boolean;
  index?: number;
}

export function HabitCard({ habit, completedToday, index = 0 }: HabitCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localCompleted, setLocalCompleted] = useState(completedToday);
  const { addXpPopup, showLevelUp, queueAchievement } = useGameStore();
  const meta = ATTRIBUTE_META[habit.attribute_type];

  const handleComplete = () => {
    if (localCompleted || isPending) return;

    setLocalCompleted(true);

    startTransition(async () => {
      try {
        const result = await completeHabit(habit.id);
        if (result.alreadyCompleted) return;

        addXpPopup({ id: nanoid(), amount: result.xpEarned });

        if (result.leveledUp) {
          showLevelUp({ oldLevel: result.oldLevel, newLevel: result.newLevel, rank: result.newRank });
        }

        result.achievementsUnlocked.forEach((a) => queueAchievement(a));

        toast.success(`+${result.xpEarned} XP`, {
          description: `"${habit.name}" abgeschlossen!`,
        });

        router.refresh();
      } catch {
        setLocalCompleted(false);
        toast.error("Fehler beim Abschließen");
      }
    });
  };

  return (
    <div
      className={cn(
        "app-card p-4 flex items-center gap-4 transition-opacity",
        "animate-in fade-in slide-in-from-left-2 duration-200",
        localCompleted && "opacity-50"
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Color accent */}
      <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />

      {/* Info */}
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
        <p className="text-xs text-muted-foreground">
          +{habit.xp_reward} XP
          {habit.description ? ` · ${habit.description}` : ""}
        </p>
      </div>

      {/* Complete button */}
      <button
        onClick={handleComplete}
        disabled={localCompleted || isPending}
        aria-label={localCompleted ? "Erledigt" : "Abschließen"}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer border",
          localCompleted
            ? "bg-indigo-500 border-indigo-500 text-white"
            : "border-border text-muted-foreground hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10",
          isPending && "opacity-60 cursor-not-allowed"
        )}
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
