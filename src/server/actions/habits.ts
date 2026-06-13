"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getLevelFromXp, getXpProgressInCurrentLevel } from "@/lib/xp";
import { getRankFromLevel } from "@/lib/ranks";
import type {
  CompleteHabitResult,
  Achievement,
  Habit,
  User,
  Attribute,
} from "@/types";

export async function completeHabit(
  habitId: string
): Promise<CompleteHabitResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");

  // Demo mode — return simulated result
  if (session.user.id === "demo-user-001") {
    revalidatePath("/dashboard");
    revalidatePath("/habits");
    return { xpEarned: 80, coinsEarned: 15, leveledUp: false, oldLevel: 7, newLevel: 7, newRank: "Bronze", achievementsUnlocked: [], streakUpdated: false, newStreak: 5, alreadyCompleted: false };
  }

  const userId = session.user.id;
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0]!;

  // Verify habit belongs to user
  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .eq("user_id", userId)
    .single();

  if (habitError || !habit) throw new Error("Gewohnheit nicht gefunden");

  // Check already completed today
  const { data: existing } = await supabase
    .from("habit_completions")
    .select("id")
    .eq("habit_id", habitId)
    .eq("completed_at", today)
    .single();

  if (existing) {
    return {
      xpEarned: 0,
      coinsEarned: 0,
      leveledUp: false,
      oldLevel: 0,
      newLevel: 0,
      newRank: "Beginner",
      achievementsUnlocked: [],
      streakUpdated: false,
      newStreak: 0,
      alreadyCompleted: true,
    };
  }

  const typedHabit = habit as Habit;

  // Insert completion
  await supabase.from("habit_completions").insert({
    habit_id: habitId,
    user_id: userId,
    completed_at: today,
    xp_earned: typedHabit.xp_reward,
    coins_earned: typedHabit.coin_reward,
  });

  // Get current user state
  const { data: userRow } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!userRow) throw new Error("User nicht gefunden");
  const user = userRow as User;

  const oldLevel = user.level;
  const newTotalXp = Number(user.total_xp) + typedHabit.xp_reward;
  const newLevel = getLevelFromXp(newTotalXp);
  const newRank = getRankFromLevel(newLevel);
  const leveledUp = newLevel > oldLevel;

  // Update user XP, coins, level, rank
  await supabase
    .from("users")
    .update({
      total_xp: newTotalXp,
      coins: user.coins + typedHabit.coin_reward,
      level: newLevel,
      rank: newRank,
    })
    .eq("id", userId);

  // Update attribute XP
  const { data: attrRow } = await supabase
    .from("attributes")
    .select("*")
    .eq("user_id", userId)
    .eq("type", typedHabit.attribute_type)
    .single();

  if (attrRow) {
    const attr = attrRow as Attribute;
    const newAttrTotalXp = Number(attr.total_xp) + typedHabit.xp_reward;
    const newAttrLevel = getLevelFromXp(newAttrTotalXp);
    const { current } = getXpProgressInCurrentLevel(newAttrTotalXp);
    await supabase
      .from("attributes")
      .update({ total_xp: newAttrTotalXp, xp: current, level: newAttrLevel })
      .eq("id", attr.id);
  }

  // Update streak
  const lastDate = user.last_activity_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0]!;

  let newStreak = user.current_streak;
  let streakUpdated = false;

  if (lastDate === yesterdayStr) {
    newStreak = user.current_streak + 1;
    streakUpdated = true;
  } else if (lastDate !== today) {
    newStreak = 1;
    streakUpdated = true;
  }

  const newLongestStreak = Math.max(user.longest_streak, newStreak);

  await supabase
    .from("users")
    .update({
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_activity_date: today,
    })
    .eq("id", userId);

  if (leveledUp) {
    await supabase.from("activity_log").insert({
      user_id: userId,
      type: "level_up",
      description: `Level ${newLevel} erreicht!`,
      xp_earned: 0,
    });
  }

  // Log habit completion
  await supabase.from("activity_log").insert({
    user_id: userId,
    type: "habit_complete",
    description: `"${typedHabit.name}" abgeschlossen`,
    xp_earned: typedHabit.xp_reward,
    attribute_type: typedHabit.attribute_type,
    reference_id: habitId,
  });

  // Check achievements
  const achievementsUnlocked = await checkAndUnlockAchievements(
    userId,
    newTotalXp,
    newLevel,
    newStreak,
    supabase
  );

  revalidatePath("/dashboard");
  revalidatePath("/habits");

  return {
    xpEarned: typedHabit.xp_reward,
    coinsEarned: typedHabit.coin_reward,
    leveledUp,
    oldLevel,
    newLevel,
    newRank,
    achievementsUnlocked,
    streakUpdated,
    newStreak,
    alreadyCompleted: false,
  };
}

async function checkAndUnlockAchievements(
  userId: string,
  totalXp: number,
  level: number,
  streak: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<Achievement[]> {
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("*");

  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const unlockedIds = new Set(
    (unlocked ?? []).map(
      (u: { achievement_id: string }) => u.achievement_id
    )
  );

  const { data: completionsCount } = await supabase
    .from("habit_completions")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  const count = completionsCount?.length ?? 0;

  const newlyUnlocked: Achievement[] = [];

  for (const achievement of allAchievements ?? []) {
    if (unlockedIds.has(achievement.id)) continue;

    let conditionMet = false;
    switch (achievement.condition_type) {
      case "streak":
        conditionMet = streak >= achievement.condition_value;
        break;
      case "level":
        conditionMet = level >= achievement.condition_value;
        break;
      case "completions":
        conditionMet = count >= achievement.condition_value;
        break;
      case "xp":
        conditionMet = totalXp >= achievement.condition_value;
        break;
    }

    if (conditionMet) {
      await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievement.id,
      });
      await supabase.from("activity_log").insert({
        user_id: userId,
        type: "achievement",
        description: `Achievement freigeschaltet: "${achievement.name}"`,
        xp_earned: achievement.xp_reward,
        reference_id: achievement.id,
      });
      newlyUnlocked.push(achievement as Achievement);
    }
  }

  return newlyUnlocked;
}

export async function createHabit(
  data: Omit<Habit, "id" | "user_id" | "is_archived" | "created_at" | "xp_reward" | "coin_reward"> & { duration_minutes?: number }
): Promise<{ id: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");

  // XP is always determined server-side by duration — no client manipulation possible
  const { calculateHabitXp } = await import("@/lib/xp");
  const xp_reward = calculateHabitXp(data.duration_minutes ?? 0);
  const coin_reward = Math.floor(xp_reward / 10);

  if (session.user.id === "demo-user-001") {
    return { id: `demo-habit-${Date.now()}` };
  }

  const supabase = createAdminClient();
  const { data: habit, error } = await supabase
    .from("habits")
    .insert({ ...data, user_id: session.user.id, xp_reward, coin_reward })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/habits");
  return { id: (habit as { id: string }).id };
}

export async function deleteHabit(habitId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");

  const supabase = createAdminClient();
  await supabase
    .from("habits")
    .update({ is_archived: true })
    .eq("id", habitId)
    .eq("user_id", session.user.id);

  revalidatePath("/habits");
}
