"use client";

import { motion } from "framer-motion";

interface XPBarProps {
  current: number;
  required: number;
  percentage: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function XPBar({
  current,
  required,
  percentage,
  showLabel = true,
  size = "md",
}: XPBarProps) {
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span className="font-medium">XP</span>
          <span>
            {current.toLocaleString()} / {required.toLocaleString()}
          </span>
        </div>
      )}
      <div className={`${heights[size]} bg-white/5 rounded-full overflow-hidden`}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
