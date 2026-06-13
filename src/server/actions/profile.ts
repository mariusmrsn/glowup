"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateProfile(data: {
  bio?: string;
  avatar_url?: string;
  height_cm?: number | null;
  weight_kg?: number | null;
  is_public?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");
  if (session.user.id === "demo-user-001") throw new Error("Demo-Modus");

  const supabase = createAdminClient();
  const update: Record<string, unknown> = {};
  if (data.bio !== undefined) update.bio = data.bio.trim().slice(0, 200);
  if (data.avatar_url !== undefined) update.avatar_url = data.avatar_url.trim() || null;
  if (data.height_cm !== undefined) update.height_cm = data.height_cm;
  if (data.weight_kg !== undefined) update.weight_kg = data.weight_kg;
  if (data.is_public !== undefined) update.is_public = data.is_public;

  const { error } = await supabase
    .from("users")
    .update(update)
    .eq("id", session.user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/profile");
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");
  if (session.user.id === "demo-user-001") throw new Error("Demo-Modus");

  if (!data.newPassword || data.newPassword.length < 8) {
    throw new Error("Neues Passwort muss mindestens 8 Zeichen haben");
  }

  const supabase = createAdminClient();

  // Fetch current password hash
  const { data: userRow } = await supabase
    .from("users")
    .select("password_hash")
    .eq("id", session.user.id)
    .single();

  if (!userRow?.password_hash) throw new Error("Kein Passwort gesetzt");

  const valid = await bcrypt.compare(data.currentPassword, userRow.password_hash);
  if (!valid) throw new Error("Aktuelles Passwort ist falsch");

  const newHash = await bcrypt.hash(data.newPassword, 12);
  const { error } = await supabase
    .from("users")
    .update({ password_hash: newHash })
    .eq("id", session.user.id);

  if (error) throw new Error(error.message);
}

export async function uploadAvatar(formData: FormData): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");
  if (session.user.id === "demo-user-001") throw new Error("Demo-Modus");

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) throw new Error("Kein Bild ausgewählt");
  if (file.size > 5 * 1024 * 1024) throw new Error("Bild zu groß (max. 5 MB)");

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) throw new Error("Nur JPG, PNG, WebP oder GIF erlaubt");

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${session.user.id}/avatar.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, arrayBuffer, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

  // Cache bust so browsers re-fetch updated avatar
  const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

  await supabase
    .from("users")
    .update({ avatar_url: urlWithCacheBust })
    .eq("id", session.user.id);

  // Bust entire layout cache so sidebar + topbar also reflect the new avatar
  revalidatePath("/", "layout");
  return urlWithCacheBust;
}
