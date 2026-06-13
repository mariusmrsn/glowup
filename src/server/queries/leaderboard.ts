import { createAdminClient } from "@/lib/supabase/server";

export interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  rank: string;
  current_streak: number;
  is_following: boolean;
  has_pending_request: boolean;
}

export async function getLeaderboard(currentUserId: string, limit = 50): Promise<LeaderboardUser[]> {
  const supabase = createAdminClient();

  const notDemo = currentUserId !== "demo-user-001";

  const [usersRes, followsRes, requestsRes] = await Promise.all([
    supabase
      .from("users")
      .select("id, username, avatar_url, level, total_xp, rank, current_streak")
      .neq("id", currentUserId)
      .eq("is_public", true)
      .order("total_xp", { ascending: false })
      .limit(limit),
    notDemo
      ? supabase.from("follows").select("following_id").eq("follower_id", currentUserId)
      : Promise.resolve({ data: [] }),
    notDemo
      ? supabase.from("follow_requests").select("target_id").eq("requester_id", currentUserId)
      : Promise.resolve({ data: [] }),
  ]);

  const following = new Set((followsRes.data ?? []).map((f: { following_id: string }) => f.following_id));
  const pending   = new Set((requestsRes.data ?? []).map((r: { target_id: string }) => r.target_id));

  return (usersRes.data ?? []).map((u) => ({
    ...u,
    total_xp: Number(u.total_xp),
    is_following: following.has(u.id),
    has_pending_request: pending.has(u.id),
  })) as LeaderboardUser[];
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  if (userId === "demo-user-001") return [];
  const supabase = createAdminClient();
  const { data } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
  return (data ?? []).map((f: { following_id: string }) => f.following_id);
}
