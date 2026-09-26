export type LeaderboardEntry = {
  initials: string;
  score: number;
  wave: number;
  ts: number;
};

export const LEADERBOARD_MAX_ENTRIES = 10;
export const INITIALS_LENGTH = 3;

export function isValidInitials(initials: string): boolean {
  return /^[A-Z]{1,3}$/.test(initials);
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch("/api/leaderboard");
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.entries) ? data.entries : [];
  } catch {
    return [];
  }
}
