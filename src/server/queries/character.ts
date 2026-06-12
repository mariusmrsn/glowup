import { createAdminClient } from "@/lib/supabase/server";
import type { User, Attribute, ActivityLog, UserAchievement } from "@/types";

export async function getCharacter(userId: string): Promise<User | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return (data as User) ?? null;
}

export async function getAttributes(userId: string): Promise<Attribute[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("attributes")
    .select("*")
    .eq("user_id", userId)
    .order("type");
  return (data as Attribute[]) ?? [];
}

export async function getRecentActivity(
  userId: string,
  limit = 10
): Promise<ActivityLog[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as ActivityLog[]) ?? [];
}

export async function getUserAchievements(
  userId: string
): Promise<UserAchievement[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("user_achievements")
    .select("*, achievement:achievements(*)")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });
  return (data as UserAchievement[]) ?? [];
}
