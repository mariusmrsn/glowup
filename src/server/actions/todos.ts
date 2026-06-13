"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getLevelFromXp } from "@/lib/xp";
import { getRankFromLevel } from "@/lib/ranks";

const TODO_XP = 20;
const TODO_COINS = 3;

export async function createTodo(data: {
  title: string;
  emoji: string;
  category: string;
  priority: string;
  due_date?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");
  if (session.user.id === "demo-user-001") throw new Error("Demo-Modus");

  const supabase = createAdminClient();
  const { error } = await supabase.from("todos").insert({
    user_id: session.user.id,
    title: data.title.trim(),
    emoji: data.emoji,
    category: data.category,
    priority: data.priority,
    due_date: data.due_date || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/todo");
}

export async function toggleTodo(todoId: string, completed: boolean): Promise<{ xpEarned: number; coinsEarned: number; leveledUp: boolean; newLevel: number; newRank: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");

  const supabase = createAdminClient();

  await supabase
    .from("todos")
    .update({ is_completed: completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", todoId)
    .eq("user_id", session.user.id);

  // Only award XP/coins when marking as completed (not uncompleting) and not demo user
  if (!completed || session.user.id === "demo-user-001") {
    revalidatePath("/todo");
    return { xpEarned: 0, coinsEarned: 0, leveledUp: false, newLevel: 0, newRank: "" };
  }

  // Fetch current user stats
  const { data: user } = await supabase
    .from("users")
    .select("total_xp, coins, level")
    .eq("id", session.user.id)
    .single();

  if (!user) { revalidatePath("/todo"); return { xpEarned: 0, coinsEarned: 0, leveledUp: false, newLevel: 0, newRank: "" }; }

  const oldLevel = Number(user.level);
  const newTotalXp = Number(user.total_xp) + TODO_XP;
  const newLevel = getLevelFromXp(newTotalXp);
  const newRank = getRankFromLevel(newLevel);
  const leveledUp = newLevel > oldLevel;

  await supabase.from("users").update({
    total_xp: newTotalXp,
    coins: Number(user.coins) + TODO_COINS,
    level: newLevel,
    rank: newRank,
  }).eq("id", session.user.id);

  // Log activity
  await supabase.from("activity_log").insert({
    user_id: session.user.id,
    type: "todo_completed",
    description: "Todo abgeschlossen",
    xp_earned: TODO_XP,
  }).then(() => {});

  revalidatePath("/todo");
  return { xpEarned: TODO_XP, coinsEarned: TODO_COINS, leveledUp, newLevel, newRank };
}

export async function deleteTodo(todoId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");

  const supabase = createAdminClient();
  const { error } = await supabase.from("todos").delete().eq("id", todoId).eq("user_id", session.user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/todo");
}
