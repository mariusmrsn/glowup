"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import type { LevelUpData } from "@/types";
import { RANK_COLORS } from "@/lib/ranks";

interface LevelUpModalProps {
  data: LevelUpData | null;
  onClose: () => void;
}

export function LevelUpModal({ data, onClose }: LevelUpModalProps) {
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [data, onClose]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 glass rounded-3xl p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4 border border-indigo-500/30 glow-purple"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 2 === 0 ? "#6366f1" : "#8b5cf6",
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i / 8) * Math.PI * 2) * 120,
                  y: Math.sin((i / 8) * Math.PI * 2) * 120,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              />
            ))}

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center glow-purple"
            >
              <Star className="w-10 h-10 text-white fill-white" />
            </motion.div>

            <div className="text-center">
              <p className="text-muted-foreground text-sm font-medium mb-1">
                LEVEL UP!
              </p>
              <motion.h2
                className="text-6xl font-black gradient-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {data.newLevel}
              </motion.h2>
              <motion.p
                className="text-lg font-semibold mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ color: RANK_COLORS[data.rank] }}
              >
                {data.rank}
              </motion.p>
            </div>

            <motion.p
              className="text-muted-foreground text-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Du wächst — weiter so! 🔥
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
