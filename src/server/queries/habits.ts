import { createAdminClient } from "@/lib/supabase/server";
import { isDemoUser, DEMO_HABITS, DEMO_COMPLETIONS, DEMO_QUESTS } from "@/lib/demo-data";
import type { Habit, HabitCompletion, DailyQuest } from "@/types";

export async function getHabits(userId: string): Promise<Habit[]> {
  if (isDemoUser(userId)) return DEMO_HABITS;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("habits").select("*").eq("user_id", userId).eq("is_archived", false).order("created_at", { ascending: false });
    return (data as Habit[]) ?? [];
  } catch { return []; }
}

export async function getTodayCompletions(userId: string): Promise<HabitCompletion[]> {
  if (isDemoUser(userId)) return DEMO_COMPLETIONS;
  const today = new Date().toISOString().split("T")[0]!;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("habit_completions").select("*").eq("user_id", userId).eq("completed_at", today);
    return (data as HabitCompletion[]) ?? [];
  } catch { return []; }
}

export async function getDailyQuests(userId: string): Promise<DailyQuest[]> {
  if (isDemoUser(userId)) return DEMO_QUESTS;
  const today = new Date().toISOString().split("T")[0]!;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("daily_quests").select("*").eq("user_id", userId).eq("quest_date", today).order("is_completed", { ascending: true });
    return (data as DailyQuest[]) ?? [];
  } catch { return []; }
}

export async function getHabitCompletionHistory(userId: string, days = 30): Promise<HabitCompletion[]> {
  if (isDemoUser(userId)) return [];
  const from = new Date();
  from.setDate(from.getDate() - days);
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("habit_completions").select("*").eq("user_id", userId).gte("completed_at", from.toISOString().split("T")[0]!).order("completed_at", { ascending: true });
    return (data as HabitCompletion[]) ?? [];
  } catch { return []; }
}
