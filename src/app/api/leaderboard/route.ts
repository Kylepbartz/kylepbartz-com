import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import {
  LEADERBOARD_MAX_ENTRIES,
  isValidInitials,
  type LeaderboardEntry,
} from "@/lib/leaderboard";

const LEADERBOARD_KEY = "andromeda:leaderboard";

function getRedis() {
  // Vercel's Upstash marketplace integration injects KV_REST_API_URL /
  // KV_REST_API_TOKEN (not the UPSTASH_REDIS_REST_* names Redis.fromEnv()
  // looks for), so read those explicitly, falling back to the Upstash
  // native names in case those are set instead (e.g. local dev via
  // `vercel env pull` from an older-style integration).
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Redis environment variables are not configured");
  }
  return new Redis({ url, token });
}

async function topEntries(redis: Redis): Promise<LeaderboardEntry[]> {
  const members = await redis.zrange<string[]>(
    LEADERBOARD_KEY,
    0,
    LEADERBOARD_MAX_ENTRIES - 1,
    { rev: true }
  );
  return members
    .map((raw) => {
      try {
        return JSON.parse(raw) as LeaderboardEntry;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is LeaderboardEntry => entry !== null);
}

export async function GET() {
  try {
    const redis = getRedis();
    const entries = await topEntries(redis);
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ entries: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { initials, score, wave } = (body ?? {}) as Record<string, unknown>;

  const cleanInitials =
    typeof initials === "string" ? initials.trim().toUpperCase() : "";
  if (!isValidInitials(cleanInitials)) {
    return NextResponse.json({ error: "invalid initials" }, { status: 400 });
  }
  if (
    typeof score !== "number" ||
    !Number.isInteger(score) ||
    score < 0 ||
    score > 999_999
  ) {
    return NextResponse.json({ error: "invalid score" }, { status: 400 });
  }
  if (
    typeof wave !== "number" ||
    !Number.isInteger(wave) ||
    wave < 1 ||
    wave > 999
  ) {
    return NextResponse.json({ error: "invalid wave" }, { status: 400 });
  }

  const entry: LeaderboardEntry = {
    initials: cleanInitials,
    score,
    wave,
    ts: Date.now(),
  };

  try {
    const redis = getRedis();
    const zaddResult = await redis.zadd(LEADERBOARD_KEY, {
      score: entry.score,
      member: JSON.stringify(entry),
    });
    // Keep only the top N. A negative stop index resolves to 0 (not a
    // no-op) once the set is smaller than N, which would delete whatever
    // was just added -- so only trim when there's actually an excess.
    const count = await redis.zcard(LEADERBOARD_KEY);
    if (count > LEADERBOARD_MAX_ENTRIES) {
      await redis.zremrangebyrank(
        LEADERBOARD_KEY,
        0,
        count - LEADERBOARD_MAX_ENTRIES - 1
      );
    }
    const entries = await topEntries(redis);
    return NextResponse.json({
      entries,
      debug: { zaddResult, count, key: LEADERBOARD_KEY, wrote: entry },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "leaderboard unavailable",
        debug: String(err),
      },
      { status: 503 }
    );
  }
}
