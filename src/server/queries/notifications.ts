import { createAdminClient } from "@/lib/supabase/server";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  kind: "notification";
}

export interface AppAnnouncement {
  id: string;
  title: string;
  body: string | null;
  emoji: string;
  created_at: string;
  is_read: boolean;
  kind: "announcement";
}

export type FeedItem = AppNotification | AppAnnouncement;

export async function getNotificationFeed(userId: string): Promise<FeedItem[]> {
  if (userId === "demo-user-001") return [];
  const supabase = createAdminClient();

  const [notifRes, announcRes, readsRes] = await Promise.all([
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then((r) => (r.error ? { data: [] } : r)),
    supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then((r) => (r.error ? { data: [] } : r)),
    supabase
      .from("announcement_reads")
      .select("announcement_id")
      .eq("user_id", userId)
      .then((r) => (r.error ? { data: [] } : r)),
  ]);

  const readAnnouncementIds = new Set(
    (readsRes.data ?? []).map((r: { announcement_id: string }) => r.announcement_id)
  );

  const notifications: AppNotification[] = (notifRes.data ?? []).map((n) => ({
    ...n,
    kind: "notification" as const,
  }));

  const announcements: AppAnnouncement[] = (announcRes.data ?? []).map((a) => ({
    ...a,
    is_read: readAnnouncementIds.has(a.id),
    kind: "announcement" as const,
  }));

  return [...notifications, ...announcements].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getUnreadCount(userId: string): Promise<number> {
  if (userId === "demo-user-001") return 0;
  const supabase = createAdminClient();

  const [notifRes, announcRes, readsRes] = await Promise.all([
    supabase
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .eq("is_read", false)
      .then((r) => (r.error ? { count: 0 } : r)),
    supabase
      .from("announcements")
      .select("id")
      .then((r) => (r.error ? { data: [] } : r)),
    supabase
      .from("announcement_reads")
      .select("announcement_id")
      .eq("user_id", userId)
      .then((r) => (r.error ? { data: [] } : r)),
  ]);

  const unreadNotifs = notifRes.count ?? 0;
  const readAnnouncIds = new Set(
    (readsRes.data ?? []).map((r: { announcement_id: string }) => r.announcement_id)
  );
  const unreadAnnouncs = (announcRes.data ?? []).filter((a: { id: string }) => !readAnnouncIds.has(a.id)).length;

  return unreadNotifs + unreadAnnouncs;
}
