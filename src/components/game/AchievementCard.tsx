"use client";

import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import type { Achievement, UserAchievement } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  index?: number;
}

export function AchievementCard({
  achievement,
  userAchievement,
  index = 0,
}: AchievementCardProps) {
  const isUnlocked = !!userAchievement;

  return (
    <motion.div
      className={cn(
        "glass-card rounded-2xl p-5 flex items-start gap-4 transition-all",
        !isUnlocked && "opacity-50 grayscale"
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isUnlocked ? 1 : 0.5, scale: 1 }}
      transition={{ delay: index * 0.04 }}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          isUnlocked
            ? "bg-amber-400/15 border border-amber-400/30"
            : "bg-white/5 border border-white/10"
        )}
      >
        {isUnlocked ? (
          <Trophy className="w-6 h-6 text-amber-400" />
        ) : (
          <Lock className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "font-semibold text-sm",
            isUnlocked ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {achievement.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {achievement.description}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-indigo-400 font-medium">
            +{achievement.xp_reward} XP
          </span>
          <span className="text-xs text-amber-400 font-medium">
            +{achievement.coin_reward} 💰
          </span>
          {userAchievement && (
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(userAchievement.unlocked_at), {
                addSuffix: true,
                locale: de,
              })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
