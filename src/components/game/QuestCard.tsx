"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { Swords, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { DailyQuest } from "@/types";
import { ATTRIBUTE_META } from "@/types";
import { completeQuest } from "@/server/actions/quests";
import { useGameStore } from "@/stores/gameStore";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  quest: DailyQuest;
  index?: number;
}

export function QuestCard({ quest, index = 0 }: QuestCardProps) {
  const [isPending, startTransition] = useTransition();
  const { addXpPopup, showLevelUp } = useGameStore();
  const meta = ATTRIBUTE_META[quest.attribute_type];
  const progress =
    quest.target_value > 1
      ? (quest.current_value / quest.target_value) * 100
      : quest.is_completed
        ? 100
        : 0;

  const handleComplete = () => {
    if (quest.is_completed || isPending) return;

    startTransition(async () => {
      try {
        const result = await completeQuest(quest.id);
        addXpPopup({ id: nanoid(), amount: result.xpEarned });
        if (result.leveledUp) {
          showLevelUp({
            oldLevel: result.newLevel - 1,
            newLevel: result.newLevel,
            rank: "Beginner",
          });
        }
        toast.success(`+${result.xpEarned} XP`, {
          description: `Quest abgeschlossen: "${quest.title}"`,
        });
      } catch {
        toast.error("Fehler beim Abschließen der Quest");
      }
    });
  };

  return (
    <motion.div
      className={cn(
        "glass-card rounded-2xl p-5 flex flex-col gap-3",
        quest.is_completed && "opacity-70"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${meta.color}20` }}
          >
            {quest.is_completed ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <Swords className="w-4 h-4" style={{ color: meta.color }} />
            )}
          </div>
          <div>
            <h3
              className={cn(
                "font-semibold text-sm",
                quest.is_completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {quest.title}
            </h3>
            <span
              className="text-[10px] font-semibold"
              style={{ color: meta.color }}
            >
              {meta.label} · +{quest.xp_reward} XP · +{quest.coin_reward} 💰
            </span>
          </div>
        </div>

        {!quest.is_completed && (
          <button
            onClick={handleComplete}
            disabled={isPending}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Erledigt"
            )}
          </button>
        )}
      </div>

      {/* Progress bar */}
      {quest.target_value > 1 && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Fortschritt</span>
            <span>
              {quest.current_value} / {quest.target_value}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: meta.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
