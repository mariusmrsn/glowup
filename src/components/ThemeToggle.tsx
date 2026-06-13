"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div
      className={`inline-flex items-center rounded-full p-1 gap-1 bg-secondary border border-border ${className}`}
    >
      <button
        onClick={() => setTheme("light")}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
          !isDark
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {!isDark && (
          <motion.div
            layoutId="theme-pill"
            className="absolute inset-0 rounded-full bg-background shadow-sm border border-border"
          />
        )}
        <Sun className="w-3.5 h-3.5 relative z-10" />
        <span className="relative z-10">Hell</span>
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
          isDark
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {isDark && (
          <motion.div
            layoutId="theme-pill"
            className="absolute inset-0 rounded-full bg-background shadow-sm border border-border"
          />
        )}
        <Moon className="w-3.5 h-3.5 relative z-10" />
        <span className="relative z-10">Dunkel</span>
      </button>
    </div>
  );
}
