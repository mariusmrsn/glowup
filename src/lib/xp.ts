export const XP_PER_LEVEL = (level: number): number =>
  Math.floor(200 * Math.pow(level, 1.9));

// Fixed XP based on duration — no user manipulation possible
export function calculateHabitXp(durationMinutes: number): number {
  if (durationMinutes <= 0) return 30;
  if (durationMinutes <= 5) return 45;
  if (durationMinutes <= 10) return 60;
  if (durationMinutes <= 15) return 70;
  if (durationMinutes <= 20) return 80;
  if (durationMinutes <= 30) return 95;
  if (durationMinutes <= 45) return 115;
  if (durationMinutes <= 60) return 140;
  if (durationMinutes <= 90) return 170;
  if (durationMinutes <= 120) return 200;
  return 240;
}

export const getTotalXpForLevel = (level: number): number =>
  Array.from({ length: level - 1 }, (_, i) => XP_PER_LEVEL(i + 1)).reduce(
    (sum, xp) => sum + xp,
    0
  );

export const getLevelFromXp = (totalXp: number): number => {
  let level = 1;
  let accumulated = 0;
  while (level < 100) {
    const xpNeeded = XP_PER_LEVEL(level);
    if (accumulated + xpNeeded > totalXp) break;
    accumulated += xpNeeded;
    level++;
  }
  return level;
};

export const getXpProgressInCurrentLevel = (
  totalXp: number
): { current: number; required: number; percentage: number } => {
  const level = getLevelFromXp(totalXp);
  const xpAtLevelStart = getTotalXpForLevel(level);
  const required = XP_PER_LEVEL(level);
  const current = totalXp - xpAtLevelStart;
  return { current, required, percentage: Math.min((current / required) * 100, 100) };
};
