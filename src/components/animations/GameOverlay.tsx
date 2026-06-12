"use client";

import { useGameStore } from "@/stores/gameStore";
import { LevelUpModal } from "./LevelUpModal";
import { AchievementToast } from "./AchievementToast";
import { XPPopupLayer } from "./XPPopup";

export function GameOverlay() {
  const { levelUpData, dismissLevelUp, pendingAchievements, dismissAchievement, pendingXpPopups, removeXpPopup } =
    useGameStore();

  return (
    <>
      <LevelUpModal data={levelUpData} onClose={dismissLevelUp} />
      <AchievementToast
        achievements={pendingAchievements}
        onDismiss={dismissAchievement}
      />
      <XPPopupLayer popups={pendingXpPopups} onRemove={removeXpPopup} />
    </>
  );
}
