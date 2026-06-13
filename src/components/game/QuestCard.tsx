"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localCompleted, setLocalCompleted] = useState(quest.is_completed);
  const { addXpPopup, showLevelUp } = useGameStore();
  const meta = ATTRIBUTE_META[quest.attribute_type];

  const progress = quest.target_value > 1
    ? (quest.current_value / quest.target_value) * 100
    : localCompleted ? 100 : 0;

  const handleComplete = () => {
    if (localCompleted || isPending) return;
    setLocalCompleted(true);
    startTransition(async () => {
      try {
        const result = await completeQuest(quest.id);
        addXpPopup({ id: nanoid(), amount: result.xpEarned });
        if (result.leveledUp) showLevelUp({ oldLevel: result.newLevel - 1, newLevel: result.newLevel, rank: "Beginner" });
        toast.success(`+${result.xpEarned} XP`, { description: `"${quest.title}" abgeschlossen!` });
        router.refresh();
      } catch {
        setLocalCompleted(false);
        toast.error("Fehler beim Abschließen");
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-300",
        localCompleted
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-white/8 bg-card hover:border-white/12"
      )}
      style={localCompleted ? {} : { boxShadow: `0 0 0 0 ${meta.color}00` }}
    >
      {/* Color accent left bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl"
        style={{ backgroundColor: localCompleted ? "#10B981" : meta.color }}
      />

      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: localCompleted ? "rgba(16,185,129,0.15)" : `${meta.color}18` }}
            >
              {localCompleted
                ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                : <span className="text-lg">{meta.emoji ?? "⚔️"}</span>
              }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={cn("font-semibold text-sm leading-snug", localCompleted ? "line-through text-muted-foreground" : "text-foreground")}>
                {quest.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="font-medium" style={{ color: meta.color }}>{meta.label}</span>
              </p>

              {/* Rewards */}
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  <Zap className="w-2.5 h-2.5" /> +{quest.xp_reward} XP
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  🪙 +{quest.coin_reward}
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          {!localCompleted && (
            <button
              onClick={handleComplete}
              disabled={isPending}
              className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              style={{ background: `linear-gradient(135deg, ${meta.color}CC, ${meta.color}88)`, color: "white" }}
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "✓ Erledigt"}
            </button>
          )}
        </div>

        {/* Progress bar */}
        {quest.target_value > 1 && (
          <div className="mt-3 ml-12">
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Fortschritt</span>
              <span>{quest.current_value} / {quest.target_value}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: meta.color }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
