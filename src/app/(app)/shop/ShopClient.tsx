"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, Check, Shirt } from "lucide-react";
import { toast } from "sonner";
import { purchaseItem, toggleEquip } from "@/server/actions/shop";
import type { ShopItem, UserItem } from "@/server/queries/shop";

const RARITY_META = {
  common: { label: "Gewöhnlich", color: "#94a3b8", bg: "bg-slate-400/10" },
  rare: { label: "Selten", color: "#3B82F6", bg: "bg-blue-500/10" },
  epic: { label: "Episch", color: "#8B5CF6", bg: "bg-violet-500/10" },
  legendary: { label: "Legendär", color: "#F59E0B", bg: "bg-amber-500/10" },
};

const TYPE_LABELS: Record<string, string> = {
  badge: "🏅 Badges",
  title: "📛 Titel",
  frame: "🖼️ Rahmen",
};

interface Props {
  items: ShopItem[];
  owned: UserItem[];
  coins: number;
}

export function ShopClient({ items, owned: initialOwned, coins }: Props) {
  const [owned, setOwned] = useState(initialOwned);
  const [activeType, setActiveType] = useState<string>("badge");
  const [isPurchasing, startPurchase] = useTransition();
  const [isEquipping, startEquip] = useTransition();

  const ownedMap = new Map(owned.map((o) => [o.item_id, o]));
  const filtered = items.filter((i) => i.type === activeType);

  const handleBuy = (item: ShopItem) => {
    if (coins < item.cost_coins) {
      toast.error(`Zu wenig Coins! Du brauchst ${item.cost_coins.toLocaleString()} 🪙`);
      return;
    }
    startPurchase(async () => {
      try {
        await purchaseItem(item.id);
        setOwned((prev) => [...prev, { item_id: item.id, equipped: false, purchased_at: new Date().toISOString() }]);
        toast.success(`${item.icon} ${item.name} gekauft!`);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Fehler beim Kauf");
      }
    });
  };

  const handleEquip = (item: ShopItem, equip: boolean) => {
    startEquip(async () => {
      try {
        await toggleEquip(item.id, equip);
        setOwned((prev) => prev.map((o) => {
          if (equip && item.type === "title" && o.item_id !== item.id) return { ...o, equipped: false };
          if (o.item_id === item.id) return { ...o, equipped: equip };
          return o;
        }));
        toast.success(equip ? `${item.name} ausgerüstet!` : "Abgelegt");
      } catch {
        toast.error("Fehler");
      }
    });
  };

  const types = [...new Set(items.map((i) => i.type))];

  return (
    <div className="space-y-5">
      {/* Type tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeType === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {TYPE_LABELS[t] ?? t}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((item, i) => {
          const ownedItem = ownedMap.get(item.id);
          const isOwned = !!ownedItem;
          const isEquipped = ownedItem?.equipped ?? false;
          const canAfford = coins >= item.cost_coins;
          const rarity = RARITY_META[item.rarity];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`app-card p-4 flex flex-col gap-3 relative overflow-hidden ${isEquipped ? "ring-2 ring-indigo-500/40" : ""}`}
            >
              {/* Rarity badge */}
              <div className="absolute top-3 right-3">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${rarity.bg}`}
                  style={{ color: rarity.color }}
                >
                  {rarity.label}
                </span>
              </div>

              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${rarity.bg}`}
              >
                {item.icon}
              </div>

              {/* Info */}
              <div>
                <p className="font-bold text-sm text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
              </div>

              {/* Price + action */}
              <div className="mt-auto">
                {isOwned ? (
                  <button
                    onClick={() => handleEquip(item, !isEquipped)}
                    disabled={isEquipping}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isEquipped
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-red-500/10 hover:text-red-500"
                        : "bg-secondary hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground"
                    }`}
                  >
                    {isEquipped ? <><Check className="w-3.5 h-3.5" /> Ausgerüstet</> : <><Shirt className="w-3.5 h-3.5" /> Ausrüsten</>}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={isPurchasing || !canAfford}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      canAfford
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span>🪙</span>
                    {item.cost_coins.toLocaleString()}
                    {!canAfford && <span className="ml-1 opacity-70">– fehlen {(item.cost_coins - coins).toLocaleString()}</span>}
                  </button>
                )}
              </div>

              {isEquipped && (
                <div className="absolute top-2 left-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
