import { createAdminClient } from "@/lib/supabase/server";
import type { User, Attribute, Achievement } from "@/types";

export interface PublicProfile {
  user: Pick<User, "id" | "username" | "avatar_url" | "level" | "total_xp" | "rank" | "current_streak" | "longest_streak" | "coins" | "created_at"> & { bio?: string | null };
  attributes: Attribute[];
  achievements: Achievement[];
  isFollowing: boolean;
  hasPendingRequest: boolean;
}

export async function getPublicProfile(
  username: string,
  viewerId: string
): Promise<PublicProfile | null> {
  const supabase = createAdminClient();

  const { data: userRow } = await supabase
    .from("users")
    .select("id, username, avatar_url, level, total_xp, rank, current_streak, longest_streak, coins, created_at, bio")
    .ilike("username", username)
    .single();

  if (!userRow) return null;

  const notDemo = viewerId !== "demo-user-001";

  const [attrsRes, achievementsRes, followsRes, requestsRes] = await Promise.all([
    supabase
      .from("attributes")
      .select("*")
      .eq("user_id", userRow.id),
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at, achievements(id, name, description, icon, condition_type, condition_value, xp_reward)")
      .eq("user_id", userRow.id)
      .order("unlocked_at", { ascending: false }),
    notDemo
      ? supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", viewerId)
          .eq("following_id", userRow.id)
          .single()
      : Promise.resolve({ data: null }),
    notDemo
      ? supabase
          .from("follow_requests")
          .select("id")
          .eq("requester_id", viewerId)
          .eq("target_id", userRow.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const achievements = (achievementsRes.data ?? []).map((row) => {
    const a = row.achievements as unknown as Achievement;
    return { ...a, unlocked_at: (row as { unlocked_at: string }).unlocked_at };
  });

  return {
    user: { ...userRow, total_xp: Number(userRow.total_xp) },
    attributes: (attrsRes.data ?? []) as Attribute[],
    achievements,
    isFollowing: !!followsRes.data,
    hasPendingRequest: !!requestsRes.data,
  };
}
