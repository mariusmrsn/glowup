"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import type { Habit } from "@/types";
import { ATTRIBUTE_META } from "@/types";
import { completeHabit } from "@/server/actions/habits";
import { useGameStore } from "@/stores/gameStore";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  completedToday: boolean;
  index?: number;
}

export function HabitCard({ habit, completedToday, index = 0 }: HabitCardProps) {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { addXpPopup, showLevelUp, queueAchievement } = useGameStore();
  const meta = ATTRIBUTE_META[habit.attribute_type];

  const handleComplete = () => {
    if (completedToday || isPending) return;

    startTransition(async () => {
      try {
        const result = await completeHabit(habit.id);
        if (result.alreadyCompleted) return;

        addXpPopup({ id: nanoid(), amount: result.xpEarned });

        if (result.leveledUp) {
          showLevelUp({
            oldLevel: result.oldLevel,
            newLevel: result.newLevel,
            rank: result.newRank,
          });
        }

        result.achievementsUnlocked.forEach((a) => queueAchievement(a));

        queryClient.invalidateQueries({ queryKey: ["character"] });
        queryClient.invalidateQueries({ queryKey: ["habits"] });

        toast.success(`+${result.xpEarned} XP`, {
          description: `"${habit.name}" abgeschlossen!`,
        });
      } catch {
        toast.error("Fehler beim Abschließen");
      }
    });
  };

  return (
    <motion.div
      className={cn(
        "glass-card rounded-2xl p-5 flex items-center gap-4 transition-colors",
        completedToday && "opacity-60"
      )}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      {/* Color dot */}
      <div
        className="w-2 h-10 rounded-full shrink-0"
        style={{ backgroundColor: habit.color }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3
            className={cn(
              "font-semibold text-sm",
              completedToday ? "line-through text-muted-foreground" : "text-foreground"
            )}
          >
            {habit.name}
          </h3>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
            style={{
              color: meta.color,
              borderColor: `${meta.color}40`,
              backgroundColor: `${meta.color}15`,
            }}
          >
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Zap className="w-3 h-3 text-indigo-400" />
          <span className="text-indigo-400 font-medium">+{habit.xp_reward} XP</span>
          {habit.description && (
            <span className="truncate">· {habit.description}</span>
          )}
        </div>
      </div>

      {/* Complete button */}
      <button
        onClick={handleComplete}
        disabled={completedToday || isPending}
        className={cn(
          "w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer",
          completedToday
            ? "bg-indigo-500 border-indigo-500 text-white"
            : "border-white/20 text-muted-foreground hover:border-indigo-500 hover:text-indigo-400",
          isPending && "opacity-50 cursor-not-allowed"
        )}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
      </button>
    </motion.div>
  );
}
