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

  // Fetch follows and pending requests in parallel
  const [followsRes, requestsRes] = await Promise.all([
    notDemo
      ? supabase.from("follows").select("following_id").eq("follower_id", currentUserId)
      : Promise.resolve({ data: [] }),
    notDemo
      ? supabase.from("follow_requests").select("target_id").eq("requester_id", currentUserId)
      : Promise.resolve({ data: [] }),
  ]);

  const following = new Set((followsRes.data ?? []).map((f: { following_id: string }) => f.following_id));
  const pending   = new Set((requestsRes.data ?? []).map((r: { target_id: string }) => r.target_id));
  const followingIds = [...following];

  // Fetch public users + any private users that current user follows
  let query = supabase
    .from("users")
    .select("id, username, avatar_url, level, total_xp, rank, current_streak")
    .neq("id", currentUserId)
    .order("total_xp", { ascending: false })
    .limit(limit);

  if (followingIds.length > 0) {
    // Show public users OR followed private users
    query = query.or(`is_public.eq.true,id.in.(${followingIds.join(",")})`);
  } else {
    query = query.eq("is_public", true);
  }

  const { data: users } = await query;

  return (users ?? []).map((u) => ({
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
