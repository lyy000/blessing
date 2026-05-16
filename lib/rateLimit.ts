import type { Client } from "@libsql/client";

const WINDOW_MS = 60_000;
const MAX_PER_VISITOR_WINDOW = 180;
const MAX_PER_IP_WINDOW = 600;

function windowStart(now: number): number {
  return Math.floor(now / WINDOW_MS) * WINDOW_MS;
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

export async function checkAndConsumeRate(
  db: Client,
  keys: { visitorKey: string; ipKey: string },
  amount: number,
  now = Date.now(),
): Promise<RateLimitResult> {
  const ws = windowStart(now);
  const tx = await db.transaction("write");
  try {
    const vRow = await tx.execute({
      sql: `SELECT count FROM ratelimit WHERE bucket_key = ? AND window_start = ?`,
      args: [keys.visitorKey, ws],
    });
    const ipRow = await tx.execute({
      sql: `SELECT count FROM ratelimit WHERE bucket_key = ? AND window_start = ?`,
      args: [keys.ipKey, ws],
    });
    const v = Number(vRow.rows[0]?.count ?? 0);
    const ip = Number(ipRow.rows[0]?.count ?? 0);
    if (v + amount > MAX_PER_VISITOR_WINDOW || ip + amount > MAX_PER_IP_WINDOW) {
      await tx.rollback();
      const next = ws + WINDOW_MS;
      const retryAfterSec = Math.max(1, Math.ceil((next - now) / 1000));
      return { ok: false, retryAfterSec };
    }
    await tx.execute({
      sql: `INSERT INTO ratelimit (bucket_key, window_start, count) VALUES (?, ?, ?)
            ON CONFLICT(bucket_key, window_start) DO UPDATE SET count = count + excluded.count`,
      args: [keys.visitorKey, ws, amount],
    });
    await tx.execute({
      sql: `INSERT INTO ratelimit (bucket_key, window_start, count) VALUES (?, ?, ?)
            ON CONFLICT(bucket_key, window_start) DO UPDATE SET count = count + excluded.count`,
      args: [keys.ipKey, ws, amount],
    });
    await tx.commit();
    return { ok: true };
  } catch (e) {
    await tx.rollback().catch(() => {});
    throw e;
  }
}
