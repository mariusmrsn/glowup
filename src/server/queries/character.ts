import { createAdminClient } from "@/lib/supabase/server";
import { isDemoUser, DEMO_USER, DEMO_ATTRIBUTES, DEMO_ACTIVITY, DEMO_USER_ACHIEVEMENTS } from "@/lib/demo-data";
import type { User, Attribute, ActivityLog, UserAchievement } from "@/types";

export async function getCharacter(userId: string): Promise<User | null> {
  if (isDemoUser(userId)) return DEMO_USER;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("users").select("*").eq("id", userId).single();
    return (data as User) ?? null;
  } catch { return null; }
}

export async function getAttributes(userId: string): Promise<Attribute[]> {
  if (isDemoUser(userId)) return DEMO_ATTRIBUTES;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("attributes").select("*").eq("user_id", userId).order("type");
    return (data as Attribute[]) ?? [];
  } catch { return []; }
}

export async function getRecentActivity(userId: string, limit = 10): Promise<ActivityLog[]> {
  if (isDemoUser(userId)) return DEMO_ACTIVITY.slice(0, limit);
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("activity_log").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
    return (data as ActivityLog[]) ?? [];
  } catch { return []; }
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  if (isDemoUser(userId)) return DEMO_USER_ACHIEVEMENTS;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("user_achievements").select("*, achievement:achievements(*)").eq("user_id", userId).order("unlocked_at", { ascending: false });
    return (data as UserAchievement[]) ?? [];
  } catch { return []; }
}
