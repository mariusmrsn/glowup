"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import type { Achievement } from "@/types";

interface AchievementToastProps {
  achievements: Achievement[];
  onDismiss: (id: string) => void;
}

export function AchievementToast({
  achievements,
  onDismiss,
}: AchievementToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {achievements.slice(0, 3).map((a) => (
          <AchievementItem key={a.id} achievement={a} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function AchievementItem({
  achievement,
  onDismiss,
}: {
  achievement: Achievement;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(achievement.id), 4000);
    return () => clearTimeout(t);
  }, [achievement.id, onDismiss]);

  return (
    <motion.div
      className="pointer-events-auto glass rounded-xl p-4 flex items-center gap-3 min-w-72 border border-amber-400/20 shadow-lg"
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="w-10 h-10 rounded-full bg-amber-400/15 flex items-center justify-center shrink-0">
        <Trophy className="w-5 h-5 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
          Achievement freigeschaltet!
        </p>
        <p className="text-sm font-bold text-foreground truncate">
          {achievement.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {achievement.description}
        </p>
      </div>
      <button
        onClick={() => onDismiss(achievement.id)}
        className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
