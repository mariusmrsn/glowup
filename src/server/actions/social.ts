"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { LeaderboardUser } from "@/server/queries/leaderboard";

export async function searchUsers(query: string): Promise<LeaderboardUser[]> {
  const session = await auth();
  if (!session?.user?.id || session.user.id === "demo-user-001") return [];

  const q = query.trim();
  if (q.length < 1) return [];

  const supabase = createAdminClient();

  const [publicRes, privateExactRes, followsRes, requestsRes] = await Promise.all([
    supabase
      .from("users")
      .select("id, username, avatar_url, level, total_xp, rank, current_streak")
      .ilike("username", `%${q}%`)
      .eq("is_public", true)
      .neq("id", session.user.id)
      .limit(10),
    supabase
      .from("users")
      .select("id, username, avatar_url, level, total_xp, rank, current_streak")
      .ilike("username", q)
      .eq("is_public", false)
      .neq("id", session.user.id)
      .limit(1),
    supabase.from("follows").select("following_id").eq("follower_id", session.user.id),
    supabase.from("follow_requests").select("target_id").eq("requester_id", session.user.id),
  ]);

  const seen = new Set<string>();
  const combined = [...(publicRes.data ?? []), ...(privateExactRes.data ?? [])].filter((u) => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });

  const following = new Set((followsRes.data ?? []).map((f: { following_id: string }) => f.following_id));
  const pending  = new Set((requestsRes.data ?? []).map((r: { target_id: string }) => r.target_id));

  return combined.map((u) => ({
    ...u,
    total_xp: Number(u.total_xp),
    is_following: following.has(u.id),
    has_pending_request: pending.has(u.id),
  })) as LeaderboardUser[];
}

// Send a follow request (does NOT follow immediately)
export async function sendFollowRequest(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.id === "demo-user-001") return;
  if (session.user.id === targetUserId) return;

  const supabase = createAdminClient();

  // Insert request (ignore duplicate)
  const { error } = await supabase
    .from("follow_requests")
    .upsert({ requester_id: session.user.id, target_id: targetUserId }, { onConflict: "requester_id,target_id" });

  if (error) throw new Error(error.message);

  // Get requester username for the notification
  const { data: requester } = await supabase
    .from("users")
    .select("username")
    .eq("id", session.user.id)
    .single();

  const requesterName = (requester as { username: string } | null)?.username ?? "Jemand";

  // Check if a follow_request notification already exists
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", targetUserId)
    .eq("type", "follow_request")
    .eq("metadata->>requester_id", session.user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from("notifications").insert({
      user_id: targetUserId,
      type: "follow_request",
      title: `${requesterName} möchte dir folgen`,
      body: null,
      metadata: { requester_id: session.user.id, requester_name: requesterName },
    });
  }

  revalidatePath("/leaderboard");
}

// Cancel a pending follow request
export async function cancelFollowRequest(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.id === "demo-user-001") return;

  const supabase = createAdminClient();
  await supabase
    .from("follow_requests")
    .delete()
    .eq("requester_id", session.user.id)
    .eq("target_id", targetUserId);

  // Also remove the notification that was sent
  await supabase
    .from("notifications")
    .delete()
    .eq("user_id", targetUserId)
    .eq("type", "follow_request")
    .eq("metadata->>requester_id", session.user.id);

  revalidatePath("/leaderboard");
}

// Accept a follow request (called by the target user)
export async function acceptFollowRequest(requesterId: string, notificationId?: string) {
  console.log("[acceptFollowRequest] called", { requesterId, notificationId });

  const session = await auth();
  console.log("[acceptFollowRequest] session userId:", session?.user?.id ?? "NULL");
  if (!session?.user?.id) throw new Error("Nicht angemeldet");
  if (session.user.id === "demo-user-001") return;

  const supabase = createAdminClient();

  // Insert A→B (requester follows acceptor)
  const r1 = await supabase
    .from("follows")
    .upsert({ follower_id: requesterId, following_id: session.user.id }, { onConflict: "follower_id,following_id" });
  console.log("[acceptFollowRequest] r1:", r1.error?.message ?? "ok");

  // Insert B→A (acceptor follows requester back — mutual)
  const r2 = await supabase
    .from("follows")
    .upsert({ follower_id: session.user.id, following_id: requesterId }, { onConflict: "follower_id,following_id" });
  console.log("[acceptFollowRequest] r2:", r2.error?.message ?? "ok");

  if (r1.error) throw new Error("DB-Fehler (r1): " + r1.error.message);
  if (r2.error) throw new Error("DB-Fehler (r2): " + r2.error.message);

  // Remove the pending request
  await supabase
    .from("follow_requests")
    .delete()
    .eq("requester_id", requesterId)
    .eq("target_id", session.user.id);

  // Mark notification as read
  if (notificationId) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
  }

  // Get current user's username
  const { data: me } = await supabase
    .from("users")
    .select("username")
    .eq("id", session.user.id)
    .single();

  const myName = (me as { username: string } | null)?.username ?? "Jemand";

  // Notify the requester that the request was accepted
  await supabase.from("notifications").insert({
    user_id: requesterId,
    type: "follow",
    title: `${myName} hat deine Anfrage angenommen`,
    body: null,
    metadata: { follower_id: session.user.id, follower_name: myName },
  });

  revalidatePath("/leaderboard");
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}

// Decline a follow request (called by the target user)
export async function declineFollowRequest(requesterId: string, notificationId?: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.id === "demo-user-001") return;

  const supabase = createAdminClient();

  // Remove the request
  await supabase
    .from("follow_requests")
    .delete()
    .eq("requester_id", requesterId)
    .eq("target_id", session.user.id);

  // Mark notification as read
  if (notificationId) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
  }

  revalidatePath("/notifications");
}

export async function unfollowUser(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.id === "demo-user-001") return;

  const supabase = createAdminClient();
  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", session.user.id)
    .eq("following_id", targetUserId);

  revalidatePath("/leaderboard");
}
