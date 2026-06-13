import { createAdminClient } from "@/lib/supabase/server";

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  type: "badge" | "title" | "frame";
  icon: string;
  cost_coins: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface UserItem {
  item_id: string;
  equipped: boolean;
  purchased_at: string;
}

export async function getShopData(userId: string): Promise<{ items: ShopItem[]; owned: UserItem[] }> {
  const supabase = createAdminClient();

  const [itemsRes, ownedRes] = await Promise.all([
    supabase.from("shop_items").select("*").order("cost_coins", { ascending: true }),
    userId !== "demo-user-001"
      ? supabase.from("user_items").select("item_id, equipped, purchased_at").eq("user_id", userId)
      : Promise.resolve({ data: [] }),
  ]);

  return {
    items: (itemsRes.data ?? []) as ShopItem[],
    owned: (ownedRes.data ?? []) as UserItem[],
  };
}
