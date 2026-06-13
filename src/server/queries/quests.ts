import { createAdminClient } from "@/lib/supabase/server";
import { QUEST_TEMPLATES } from "@/types";

export async function ensureDailyQuests(userId: string): Promise<void> {
  if (userId === "demo-user-001") return;

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0]!;

  const { data: existing } = await supabase
    .from("daily_quests")
    .select("id")
    .eq("user_id", userId)
    .eq("quest_date", today);

  if (existing && existing.length >= 3) return;

  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  await supabase.from("daily_quests").insert(
    selected.map((q) => ({ ...q, user_id: userId, quest_date: today }))
  );
}
