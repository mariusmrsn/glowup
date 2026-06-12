"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
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

        if (result.leveledUp) {
          showLevelUp({ oldLevel: result.newLevel - 1, newLevel: result.newLevel, rank: "Beginner" });
        }

        toast.success(`+${result.xpEarned} XP`, {
          description: `"${quest.title}" abgeschlossen!`,
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
        "app-card p-4 transition-opacity",
        "animate-in fade-in slide-in-from-bottom-2 duration-200",
        localCompleted && "opacity-50"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: `${meta.color}18` }}
          >
            {localCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <span className="text-base">⚔️</span>
            )}
          </div>
          <div>
            <h3 className={cn("font-medium text-sm", localCompleted ? "line-through text-muted-foreground" : "text-foreground")}>
              {quest.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span style={{ color: meta.color }}>{meta.label}</span>
              {" · "}+{quest.xp_reward} XP · +{quest.coin_reward} Coins
            </p>
          </div>
        </div>

        {!localCompleted && (
          <button
            onClick={handleComplete}
            disabled={isPending}
            className="shrink-0 flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Erledigt"}
          </button>
        )}
      </div>

      {/* Progress bar */}
      {quest.target_value > 1 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Fortschritt</span>
            <span>{quest.current_value} / {quest.target_value}</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: meta.color }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
