interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 ${sizes[size]}`}
    >
      Lv.{level}
    </span>
  );
}
