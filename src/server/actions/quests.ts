"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getLevelFromXp } from "@/lib/xp";
import { getRankFromLevel } from "@/lib/ranks";
import type { DailyQuest, User } from "@/types";
import { QUEST_TEMPLATES } from "@/types";

export async function generateDailyQuests(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  if (session.user.id === "demo-user-001") return;

  const userId = session.user.id;
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0]!;

  const { data: existing } = await supabase
    .from("daily_quests")
    .select("id")
    .eq("user_id", userId)
    .eq("quest_date", today);

  if (existing && existing.length >= 3) return;

  // Pick 3 random quests from templates
  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  await supabase.from("daily_quests").insert(
    selected.map((q) => ({ ...q, user_id: userId, quest_date: today }))
  );

  revalidatePath("/dashboard");
  revalidatePath("/quests");
}

export async function completeQuest(questId: string): Promise<{
  xpEarned: number;
  coinsEarned: number;
  leveledUp: boolean;
  newLevel: number;
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");

  const userId = session.user.id;

  // Demo mode
  if (userId === "demo-user-001") {
    revalidatePath("/dashboard");
    revalidatePath("/quests");
    return { xpEarned: 100, coinsEarned: 20, leveledUp: false, newLevel: 7 };
  }

  const supabase = createAdminClient();

  const { data: questRow } = await supabase
    .from("daily_quests")
    .select("*")
    .eq("id", questId)
    .eq("user_id", userId)
    .single();

  if (!questRow) throw new Error("Quest nicht gefunden");

  const quest = questRow as DailyQuest;
  if (quest.is_completed) return { xpEarned: 0, coinsEarned: 0, leveledUp: false, newLevel: 0 };

  await supabase
    .from("daily_quests")
    .update({ is_completed: true, current_value: quest.target_value })
    .eq("id", questId);

  const { data: userRow } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!userRow) throw new Error("User nicht gefunden");
  const user = userRow as User;

  const oldLevel = user.level;
  const newTotalXp = Number(user.total_xp) + quest.xp_reward;
  const newLevel = getLevelFromXp(newTotalXp);
  const newRank = getRankFromLevel(newLevel);
  const leveledUp = newLevel > oldLevel;

  await supabase
    .from("users")
    .update({
      total_xp: newTotalXp,
      coins: user.coins + quest.coin_reward,
      level: newLevel,
      rank: newRank,
    })
    .eq("id", userId);

  await supabase.from("activity_log").insert({
    user_id: userId,
    type: "quest_complete",
    description: `Quest abgeschlossen: "${quest.title}"`,
    xp_earned: quest.xp_reward,
    attribute_type: quest.attribute_type,
    reference_id: questId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/quests");

  return {
    xpEarned: quest.xp_reward,
    coinsEarned: quest.coin_reward,
    leveledUp,
    newLevel,
  };
}
