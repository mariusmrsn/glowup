"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function isAdmin(email?: string | null) {
  return !!email && email === process.env.ADMIN_EMAIL;
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id || session.user.id === "demo-user-001") return;

  const supabase = createAdminClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", session.user.id)
    .eq("is_read", false);

  revalidatePath("/notifications");
}

export async function markAnnouncementRead(announcementId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.id === "demo-user-001") return;

  const supabase = createAdminClient();
  await supabase
    .from("announcement_reads")
    .upsert({ user_id: session.user.id, announcement_id: announcementId })
    .select();

  revalidatePath("/notifications");
}

export async function markAllAnnouncementsRead() {
  const session = await auth();
  if (!session?.user?.id || session.user.id === "demo-user-001") return;
  const userId = session.user.id;

  const supabase = createAdminClient();
  const { data: all } = await supabase.from("announcements").select("id");
  if (!all?.length) return;

  await supabase.from("announcement_reads").upsert(
    all.map((a: { id: string }) => ({ user_id: userId, announcement_id: a.id }))
  );

  revalidatePath("/notifications");
}

export async function postAnnouncement(data: { title: string; body: string; emoji: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");
  if (!isAdmin(session.user.email)) throw new Error("Kein Admin");

  const supabase = createAdminClient();
  const { error } = await supabase.from("announcements").insert({
    title: data.title.trim(),
    body: data.body.trim() || null,
    emoji: data.emoji || "📢",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/notifications");
}

export async function createAdminNotification(data: {
  type: string;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const supabase = createAdminClient();
  const { data: adminUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", adminEmail)
    .single();

  if (!adminUser) return;

  await supabase.from("notifications").insert({
    user_id: adminUser.id,
    type: data.type,
    title: data.title,
    body: data.body ?? null,
    metadata: data.metadata ?? {},
  });
}
