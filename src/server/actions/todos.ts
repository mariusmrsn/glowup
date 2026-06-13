"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function toggleTodo(todoId: string, completed: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("todos")
    .update({ is_completed: completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", todoId)
    .eq("user_id", session.user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/todo");
}

export async function deleteTodo(todoId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");

  const supabase = createAdminClient();
  const { error } = await supabase.from("todos").delete().eq("id", todoId).eq("user_id", session.user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/todo");
}
