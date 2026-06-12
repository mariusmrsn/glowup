import type { RankName } from "@/lib/ranks";

export type AttributeType =
  | "strength"
  | "intelligence"
  | "economy"
  | "discipline"
  | "social"
  | "health";

export type HabitFrequency = "daily" | "weekly";
export type ActivityType =
  | "habit_complete"
  | "quest_complete"
  | "level_up"
  | "achievement"
  | "streak";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  rank: RankName;
  title: string;
  coins: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attribute {
  id: string;
  user_id: string;
  type: AttributeType;
  level: number;
  xp: number;
  total_xp: number;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  attribute_type: AttributeType;
  xp_reward: number;
  coin_reward: number;
  frequency: HabitFrequency;
  icon: string;
  color: string;
  is_archived: boolean;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  xp_earned: number;
  coins_earned: number;
  created_at?: string;
}

export interface DailyQuest {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  attribute_type: AttributeType;
  xp_reward: number;
  coin_reward: number;
  target_value: number;
  current_value: number;
  is_completed: boolean;
  quest_date: string;
  created_at?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  coin_reward: number;
  condition_type: "streak" | "level" | "completions" | "xp";
  condition_value: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  type: ActivityType;
  description: string;
  xp_earned: number;
  attribute_type: AttributeType | null;
  reference_id: string | null;
  created_at: string;
}

export interface CompleteHabitResult {
  xpEarned: number;
  coinsEarned: number;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  newRank: RankName;
  achievementsUnlocked: Achievement[];
  streakUpdated: boolean;
  newStreak: number;
  alreadyCompleted: boolean;
}

export interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  rank: RankName;
}

export interface XpPopup {
  id: string;
  amount: number;
}

export const ATTRIBUTE_META: Record<
  AttributeType,
  { label: string; icon: string; color: string; description: string }
> = {
  strength: {
    label: "Stärke",
    icon: "dumbbell",
    color: "#EF4444",
    description: "Fitness & körperliche Aktivität",
  },
  intelligence: {
    label: "Intelligenz",
    icon: "brain",
    color: "#3B82F6",
    description: "Wissen & Lernen",
  },
  economy: {
    label: "Wirtschaft",
    icon: "trending-up",
    color: "#F59E0B",
    description: "Finanzen & Investitionen",
  },
  discipline: {
    label: "Disziplin",
    icon: "target",
    color: "#8B5CF6",
    description: "Gewohnheiten & Selbstkontrolle",
  },
  social: {
    label: "Sozial",
    icon: "users",
    color: "#EC4899",
    description: "Beziehungen & Netzwerk",
  },
  health: {
    label: "Gesundheit",
    icon: "heart",
    color: "#10B981",
    description: "Schlaf & Wohlbefinden",
  },
};

export const QUEST_TEMPLATES: Array<{
  title: string;
  description: string;
  attribute_type: AttributeType;
  xp_reward: number;
  coin_reward: number;
  target_value: number;
}> = [
  {
    title: "10.000 Schritte gehen",
    description: "Bewege dich und erreiche dein Tagesziel",
    attribute_type: "strength",
    xp_reward: 150,
    coin_reward: 30,
    target_value: 10000,
  },
  {
    title: "20 Minuten lesen",
    description: "Erweitere dein Wissen durch Lesen",
    attribute_type: "intelligence",
    xp_reward: 100,
    coin_reward: 20,
    target_value: 20,
  },
  {
    title: "2 Liter Wasser trinken",
    description: "Bleib den ganzen Tag hydriert",
    attribute_type: "health",
    xp_reward: 80,
    coin_reward: 15,
    target_value: 2,
  },
  {
    title: "Zimmer aufräumen",
    description: "Ordnung schafft Klarheit im Kopf",
    attribute_type: "discipline",
    xp_reward: 100,
    coin_reward: 20,
    target_value: 1,
  },
  {
    title: "Jemanden anrufen",
    description: "Pflege deine sozialen Kontakte",
    attribute_type: "social",
    xp_reward: 80,
    coin_reward: 15,
    target_value: 1,
  },
  {
    title: "Ausgaben tracken",
    description: "Behalte deine Finanzen im Blick",
    attribute_type: "economy",
    xp_reward: 80,
    coin_reward: 15,
    target_value: 1,
  },
  {
    title: "30 Minuten trainieren",
    description: "Stärke deinen Körper durch Sport",
    attribute_type: "strength",
    xp_reward: 150,
    coin_reward: 30,
    target_value: 30,
  },
  {
    title: "8 Stunden schlafen",
    description: "Erhole dich für den nächsten Tag",
    attribute_type: "health",
    xp_reward: 120,
    coin_reward: 25,
    target_value: 8,
  },
];
