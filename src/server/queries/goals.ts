import { createAdminClient } from "@/lib/supabase/server";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string;
  emoji: string;
  category: string;
  is_completed: boolean;
  created_at: string;
}

export async function getGoals(userId: string): Promise<Goal[]> {
  if (userId === "demo-user-001") return DEMO_GOALS;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("target_date", { ascending: true });
  if (error) return [];
  return (data ?? []) as Goal[];
}

const DEMO_GOALS: Goal[] = [
  {
    id: "demo-g1",
    user_id: "demo-user-001",
    title: "Sommer Body",
    description: "Fit und definiert für den Sommer",
    target_date: new Date(new Date().getFullYear(), 5, 21).toISOString().split("T")[0]!,
    emoji: "🏖️",
    category: "fitness",
    is_completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-g2",
    user_id: "demo-user-001",
    title: "Führerschein machen",
    description: "Theorie und Praxis bestehen",
    target_date: new Date(new Date().getFullYear(), 8, 1).toISOString().split("T")[0]!,
    emoji: "🚗",
    category: "personal",
    is_completed: false,
    created_at: new Date().toISOString(),
  },
];
