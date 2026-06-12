export type RankName =
  | "Beginner"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Master"
  | "Legend";

export const RANK_THRESHOLDS: Record<RankName, number> = {
  Beginner: 0,
  Bronze: 5,
  Silver: 15,
  Gold: 30,
  Platinum: 50,
  Diamond: 70,
  Master: 85,
  Legend: 100,
};

export const RANK_COLORS: Record<RankName, string> = {
  Beginner: "#94a3b8",
  Bronze: "#b45309",
  Silver: "#94a3b8",
  Gold: "#d97706",
  Platinum: "#0d9488",
  Diamond: "#3b82f6",
  Master: "#8b5cf6",
  Legend: "#ec4899",
};

export const getRankFromLevel = (level: number): RankName => {
  const entries = Object.entries(RANK_THRESHOLDS) as [RankName, number][];
  return (
    entries
      .slice()
      .reverse()
      .find(([, threshold]) => level >= threshold)?.[0] ?? "Beginner"
  );
};
