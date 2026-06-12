"use client";

import { motion } from "framer-motion";
import {
  Dumbbell,
  Brain,
  TrendingUp,
  Target,
  Users,
  Heart,
} from "lucide-react";
import type { Attribute } from "@/types";
import { ATTRIBUTE_META } from "@/types";
import { getXpProgressInCurrentLevel } from "@/lib/xp";

const ICONS = {
  strength: Dumbbell,
  intelligence: Brain,
  economy: TrendingUp,
  discipline: Target,
  social: Users,
  health: Heart,
};

interface AttributeCardProps {
  attribute: Attribute;
  index?: number;
}

export function AttributeCard({ attribute, index = 0 }: AttributeCardProps) {
  const meta = ATTRIBUTE_META[attribute.type];
  const Icon = ICONS[attribute.type];
  const progress = getXpProgressInCurrentLevel(Number(attribute.total_xp));

  return (
    <motion.div
      className="glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-white/10 transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${meta.color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: meta.color }} />
        </div>
        <span
          className="text-xs font-bold rounded-full px-2 py-0.5 border"
          style={{
            color: meta.color,
            borderColor: `${meta.color}40`,
            backgroundColor: `${meta.color}15`,
          }}
        >
          Lv.{attribute.level}
        </span>
      </div>

      <div>
        <h3 className="font-semibold text-foreground text-sm">{meta.label}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>XP</span>
          <span>
            {progress.current.toLocaleString()} / {progress.required.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: meta.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.05 + 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
