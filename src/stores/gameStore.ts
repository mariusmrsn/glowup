"use client";

import { create } from "zustand";
import type { Achievement, LevelUpData, XpPopup } from "@/types";

interface GameStore {
  pendingXpPopups: XpPopup[];
  addXpPopup: (popup: XpPopup) => void;
  removeXpPopup: (id: string) => void;

  levelUpData: LevelUpData | null;
  showLevelUp: (data: LevelUpData) => void;
  dismissLevelUp: () => void;

  pendingAchievements: Achievement[];
  queueAchievement: (achievement: Achievement) => void;
  dismissAchievement: (id: string) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  pendingXpPopups: [],
  addXpPopup: (popup) =>
    set((s) => ({ pendingXpPopups: [...s.pendingXpPopups, popup] })),
  removeXpPopup: (id) =>
    set((s) => ({
      pendingXpPopups: s.pendingXpPopups.filter((p) => p.id !== id),
    })),

  levelUpData: null,
  showLevelUp: (data) => set({ levelUpData: data }),
  dismissLevelUp: () => set({ levelUpData: null }),

  pendingAchievements: [],
  queueAchievement: (achievement) =>
    set((s) => ({
      pendingAchievements: [...s.pendingAchievements, achievement],
    })),
  dismissAchievement: (id) =>
    set((s) => ({
      pendingAchievements: s.pendingAchievements.filter((a) => a.id !== id),
    })),
}));
