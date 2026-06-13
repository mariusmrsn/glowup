import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCharacter } from "@/server/queries/character";
import { getShopData } from "@/server/queries/shop";
import { TopBar } from "@/components/layout/TopBar";
import { ShopClient } from "./ShopClient";

export default async function ShopPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, { items, owned }] = await Promise.all([
    getCharacter(session.user.id),
    getShopData(session.user.id),
  ]);

  return (
    <div>
      <TopBar title="Shop" user={user} />
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-5 app-card p-4">
          <div className="text-2xl">🪙</div>
          <div>
            <p className="font-bold text-foreground">{user?.coins.toLocaleString() ?? "0"} Coins</p>
            <p className="text-xs text-muted-foreground">Verdiene Coins durch Habits & Quests</p>
          </div>
        </div>
        <ShopClient items={items} owned={owned} coins={user?.coins ?? 0} />
      </div>
    </div>
  );
}
