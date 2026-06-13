"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function purchaseItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");
  if (session.user.id === "demo-user-001") throw new Error("Demo-Modus");

  const supabase = createAdminClient();

  const [itemRes, userRes] = await Promise.all([
    supabase.from("shop_items").select("cost_coins").eq("id", itemId).single(),
    supabase.from("users").select("coins").eq("id", session.user.id).single(),
  ]);

  if (itemRes.error || !itemRes.data) throw new Error("Item nicht gefunden");
  if (userRes.error || !userRes.data) throw new Error("User nicht gefunden");

  if (userRes.data.coins < itemRes.data.cost_coins) {
    throw new Error(`Nicht genug Coins. Du brauchst ${itemRes.data.cost_coins}, hast aber ${userRes.data.coins}.`);
  }

  const { error: existing } = await supabase
    .from("user_items")
    .select("item_id")
    .eq("user_id", session.user.id)
    .eq("item_id", itemId)
    .single();

  if (!existing) {
    throw new Error("Du besitzt dieses Item bereits");
  }

  await Promise.all([
    supabase.from("user_items").insert({ user_id: session.user.id, item_id: itemId }),
    supabase.from("users").update({ coins: userRes.data.coins - itemRes.data.cost_coins }).eq("id", session.user.id),
  ]);

  revalidatePath("/shop");
  revalidatePath("/profile");
}

export async function toggleEquip(itemId: string, equip: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht angemeldet");

  const supabase = createAdminClient();

  if (equip) {
    const itemType = await supabase.from("shop_items").select("type").eq("id", itemId).single();
    if (itemType.data?.type === "title") {
      await supabase.from("user_items")
        .update({ equipped: false })
        .eq("user_id", session.user.id)
        .in("item_id", (
          await supabase.from("shop_items").select("id").eq("type", "title").then((r) => (r.data ?? []).map((i: { id: string }) => i.id))
        ));
    }
  }

  await supabase.from("user_items")
    .update({ equipped: equip })
    .eq("user_id", session.user.id)
    .eq("item_id", itemId);

  revalidatePath("/shop");
  revalidatePath("/profile");
}
