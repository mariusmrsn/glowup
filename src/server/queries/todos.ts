import { createAdminClient } from "@/lib/supabase/server";

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  emoji: string;
  category: string;
  is_completed: boolean;
  due_date: string | null;
  priority: "low" | "normal" | "high";
  created_at: string;
  completed_at: string | null;
}

export async function getTodos(userId: string): Promise<Todo[]> {
  if (userId === "demo-user-001") return DEMO_TODOS;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .order("is_completed", { ascending: true })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Todo[];
}

const today = new Date().toISOString().split("T")[0]!;
const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split("T")[0]!;

const DEMO_TODOS: Todo[] = [
  { id: "d1", user_id: "demo-user-001", title: "Mathe Hausaufgaben", emoji: "📐", category: "schule", is_completed: false, due_date: today, priority: "high", created_at: new Date().toISOString(), completed_at: null },
  { id: "d2", user_id: "demo-user-001", title: "Einkaufen: Gemüse, Proteinriegel", emoji: "🛒", category: "einkauf", is_completed: false, due_date: today, priority: "normal", created_at: new Date().toISOString(), completed_at: null },
  { id: "d3", user_id: "demo-user-001", title: "Zimmer aufräumen", emoji: "🧹", category: "privat", is_completed: true, due_date: tomorrow, priority: "low", created_at: new Date().toISOString(), completed_at: new Date().toISOString() },
];
