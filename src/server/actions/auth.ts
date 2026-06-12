"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getLevelFromXp } from "@/lib/xp";
import { getRankFromLevel } from "@/lib/ranks";

export async function registerUser(formData: FormData): Promise<{ error?: string }> {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;
  const username = (formData.get("username") as string)?.trim();

  if (!email || !password || !username) {
    return { error: "Alle Felder sind erforderlich." };
  }
  if (username.length < 2 || username.length > 30) {
    return { error: "Benutzername: 2–30 Zeichen." };
  }
  if (password.length < 6) {
    return { error: "Passwort mindestens 6 Zeichen." };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) return { error: "E-Mail bereits vergeben." };

  const passwordHash = await bcrypt.hash(password, 12);
  const level = getLevelFromXp(0);
  const rank = getRankFromLevel(level);

  const { error: insertErr } = await supabase.from("users").insert({
    email,
    username,
    password_hash: passwordHash,
    level,
    total_xp: 0,
    rank,
    coins: 0,
    current_streak: 0,
    longest_streak: 0,
    title: "Neuling",
    avatar_url: null,
  });

  if (insertErr) {
    return { error: "Registrierung fehlgeschlagen. Supabase-Verbindung prüfen." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (err) {
    // Next.js throws a NEXT_REDIRECT — rethrow it
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: "Login nach Registrierung fehlgeschlagen." };
  }

  return {};
}

export async function loginUser(formData: FormData): Promise<{ error?: string }> {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "E-Mail und Passwort eingeben." };

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: "E-Mail oder Passwort falsch." };
  }

  return {};
}
