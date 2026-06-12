import type { RankName } from "@/lib/ranks";
import { RANK_COLORS } from "@/lib/ranks";

interface RankBadgeProps {
  rank: RankName;
  size?: "sm" | "md" | "lg";
}

export function RankBadge({ rank, size = "md" }: RankBadgeProps) {
  const color = RANK_COLORS[rank];
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${sizes[size]}`}
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}15`,
      }}
    >
      {rank}
    </span>
  );
}
