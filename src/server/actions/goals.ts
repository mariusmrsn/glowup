"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGoal(data: {
  title: string;
  description?: string;
  target_date: string;
  emoji: string;
  category: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");
  if (session.user.id === "demo-user-001") throw new Error("Demo-Modus");

  const supabase = createAdminClient();
  const { error } = await supabase.from("goals").insert({
    user_id: session.user.id,
    title: data.title.trim(),
    description: data.description?.trim() || null,
    target_date: data.target_date,
    emoji: data.emoji,
    category: data.category,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/goals");
}

export async function toggleGoalComplete(goalId: string, completed: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("goals")
    .update({ is_completed: completed })
    .eq("id", goalId)
    .eq("user_id", session.user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/goals");
}

export async function deleteGoal(goalId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", session.user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/goals");
}
