import { Flame } from "lucide-react";

interface StreakCounterProps {
  streak: number;
  size?: "sm" | "md" | "lg";
}

export function StreakCounter({ streak, size = "md" }: StreakCounterProps) {
  const color =
    streak >= 30
      ? "#ef4444"
      : streak >= 7
        ? "#f97316"
        : streak >= 3
          ? "#fb923c"
          : "#94a3b8";

  const sizes = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2",
  };

  const iconSizes = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };

  if (streak === 0) {
    return (
      <span className={`flex items-center ${sizes[size]} text-muted-foreground`}>
        <Flame className={iconSizes[size]} />
        Kein Streak
      </span>
    );
  }

  return (
    <span
      className={`flex items-center font-semibold ${sizes[size]}`}
      style={{ color }}
    >
      <Flame className={`${iconSizes[size]} fill-current`} />
      {streak} {streak === 1 ? "Tag" : "Tage"}
    </span>
  );
}
