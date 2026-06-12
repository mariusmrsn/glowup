import type { User, Attribute, Habit, HabitCompletion, DailyQuest, ActivityLog, Achievement, UserAchievement } from "@/types";

export const DEMO_USER_ID = "demo-user-001";

export const isDemoUser = (userId: string) => userId === DEMO_USER_ID;

export const DEMO_USER: User = {
  id: DEMO_USER_ID,
  username: "DemoHero",
  email: "demo@glowup.app",
  avatar_url: null,
  level: 7,
  total_xp: 3240,
  rank: "Bronze",
  title: "Rising Star",
  coins: 320,
  current_streak: 5,
  longest_streak: 12,
  last_activity_date: new Date().toISOString().split("T")[0]!,
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_ATTRIBUTES: Attribute[] = [
  { id: "a1", user_id: DEMO_USER_ID, type: "strength",     level: 4, xp: 180, total_xp: 780 },
  { id: "a2", user_id: DEMO_USER_ID, type: "intelligence", level: 6, xp: 320, total_xp: 1820 },
  { id: "a3", user_id: DEMO_USER_ID, type: "economy",      level: 3, xp: 90,  total_xp: 390 },
  { id: "a4", user_id: DEMO_USER_ID, type: "discipline",   level: 5, xp: 250, total_xp: 1250 },
  { id: "a5", user_id: DEMO_USER_ID, type: "social",       level: 3, xp: 120, total_xp: 420 },
  { id: "a6", user_id: DEMO_USER_ID, type: "health",       level: 4, xp: 200, total_xp: 800 },
];

export const DEMO_HABITS: Habit[] = [
  { id: "h1", user_id: DEMO_USER_ID, name: "30 Minuten lesen", description: "Täglich Wissen aufbauen", attribute_type: "intelligence", xp_reward: 80,  coin_reward: 15, frequency: "daily", icon: "book",     color: "#3B82F6", is_archived: false, created_at: new Date().toISOString() },
  { id: "h2", user_id: DEMO_USER_ID, name: "Trainieren",       description: "Sport & Fitness",         attribute_type: "strength",     xp_reward: 120, coin_reward: 25, frequency: "daily", icon: "dumbbell", color: "#EF4444", is_archived: false, created_at: new Date().toISOString() },
  { id: "h3", user_id: DEMO_USER_ID, name: "Wasser trinken",   description: "2 Liter pro Tag",         attribute_type: "health",       xp_reward: 50,  coin_reward: 10, frequency: "daily", icon: "droplets", color: "#10B981", is_archived: false, created_at: new Date().toISOString() },
  { id: "h4", user_id: DEMO_USER_ID, name: "Früh schlafen",    description: "Vor 23 Uhr ins Bett",     attribute_type: "health",       xp_reward: 60,  coin_reward: 12, frequency: "daily", icon: "moon",     color: "#8B5CF6", is_archived: false, created_at: new Date().toISOString() },
  { id: "h5", user_id: DEMO_USER_ID, name: "Ausgaben tracken", description: "Finanzen im Blick",       attribute_type: "economy",      xp_reward: 40,  coin_reward: 8,  frequency: "daily", icon: "wallet",   color: "#F59E0B", is_archived: false, created_at: new Date().toISOString() },
];

const today = new Date().toISOString().split("T")[0]!;

export const DEMO_COMPLETIONS: HabitCompletion[] = [
  { id: "c1", habit_id: "h1", user_id: DEMO_USER_ID, completed_at: today, xp_earned: 80,  coins_earned: 15, created_at: new Date().toISOString() },
  { id: "c2", habit_id: "h3", user_id: DEMO_USER_ID, completed_at: today, xp_earned: 50,  coins_earned: 10, created_at: new Date().toISOString() },
];

export const DEMO_QUESTS: DailyQuest[] = [
  { id: "q1", user_id: DEMO_USER_ID, title: "10.000 Schritte gehen",  description: "Bewege dich!",        attribute_type: "strength",     xp_reward: 150, coin_reward: 30, target_value: 10000, current_value: 6200, is_completed: false, quest_date: today, created_at: new Date().toISOString() },
  { id: "q2", user_id: DEMO_USER_ID, title: "20 Minuten lesen",       description: "Lerne etwas Neues",   attribute_type: "intelligence", xp_reward: 100, coin_reward: 20, target_value: 20,    current_value: 20,   is_completed: true,  quest_date: today, created_at: new Date().toISOString() },
  { id: "q3", user_id: DEMO_USER_ID, title: "2 Liter Wasser trinken", description: "Bleib hydriert",      attribute_type: "health",       xp_reward: 80,  coin_reward: 15, target_value: 2,     current_value: 1,    is_completed: false, quest_date: today, created_at: new Date().toISOString() },
];

export const DEMO_ACTIVITY: ActivityLog[] = [
  { id: "l1", user_id: DEMO_USER_ID, type: "habit_complete",  description: '"30 Minuten lesen" abgeschlossen',    xp_earned: 80,  attribute_type: "intelligence", reference_id: "h1", created_at: new Date(Date.now() - 1  * 60 * 60 * 1000).toISOString() },
  { id: "l2", user_id: DEMO_USER_ID, type: "habit_complete",  description: '"Wasser trinken" abgeschlossen',      xp_earned: 50,  attribute_type: "health",       reference_id: "h3", created_at: new Date(Date.now() - 2  * 60 * 60 * 1000).toISOString() },
  { id: "l3", user_id: DEMO_USER_ID, type: "quest_complete",  description: 'Quest: "20 Minuten lesen"',           xp_earned: 100, attribute_type: "intelligence", reference_id: "q2", created_at: new Date(Date.now() - 3  * 60 * 60 * 1000).toISOString() },
  { id: "l4", user_id: DEMO_USER_ID, type: "achievement",     description: 'Achievement: "First Step"',           xp_earned: 100, attribute_type: null,           reference_id: "first-habit", created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: "l5", user_id: DEMO_USER_ID, type: "level_up",        description: "Level 7 erreicht!",                   xp_earned: 0,   attribute_type: null,           reference_id: null, created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
];

export const DEMO_ACHIEVEMENTS: Achievement[] = [
  { id: "first-habit",    name: "First Step",         description: "Complete your first habit",    icon: "footprints", xp_reward: 100,  coin_reward: 25,  condition_type: "completions", condition_value: 1 },
  { id: "streak-7",       name: "Week Warrior",       description: "Maintain a 7-day streak",      icon: "flame",      xp_reward: 300,  coin_reward: 75,  condition_type: "streak",      condition_value: 7 },
  { id: "level-5",        name: "Rising Star",        description: "Reach level 5",                icon: "star",       xp_reward: 200,  coin_reward: 50,  condition_type: "level",       condition_value: 5 },
  { id: "completions-10", name: "Getting Consistent", description: "Complete 10 habits total",     icon: "check",      xp_reward: 150,  coin_reward: 40,  condition_type: "completions", condition_value: 10 },
  { id: "streak-30",      name: "Monthly Legend",     description: "Maintain a 30-day streak",     icon: "crown",      xp_reward: 1000, coin_reward: 250, condition_type: "streak",      condition_value: 30 },
  { id: "level-10",       name: "Veteran",            description: "Reach level 10",               icon: "award",      xp_reward: 500,  coin_reward: 100, condition_type: "level",       condition_value: 10 },
];

export const DEMO_USER_ACHIEVEMENTS: UserAchievement[] = [
  { id: "ua1", user_id: DEMO_USER_ID, achievement_id: "first-habit", unlocked_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), achievement: DEMO_ACHIEVEMENTS[0] },
  { id: "ua2", user_id: DEMO_USER_ID, achievement_id: "level-5",     unlocked_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), achievement: DEMO_ACHIEVEMENTS[2] },
];

// 30-day completion history for stats
export const DEMO_COMPLETION_HISTORY = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toISOString().split("T")[0]!,
    count: i < 28 ? Math.floor(Math.random() * 4) + (i > 20 ? 2 : 1) : 2,
    label: d.toLocaleDateString("de-DE", { month: "short", day: "numeric" }),
  };
});
