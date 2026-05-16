import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkAndConsumeRate } from "@/lib/rateLimit";
import { isValidVisitorId } from "@/lib/validation";

export const runtime = "nodejs";

const CRIT_P = 0.06;

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "0.0.0.0";
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const visitorId = typeof b.visitorId === "string" ? b.visitorId : "";
  const displayName =
    typeof b.displayName === "string" ? b.displayName.trim() : "";
  const amount =
    typeof b.amount === "number" && Number.isFinite(b.amount)
      ? Math.floor(b.amount)
      : 1;

  if (!isValidVisitorId(visitorId)) {
    return NextResponse.json({ error: "invalid_visitor" }, { status: 400 });
  }
  if (displayName.length < 1 || displayName.length > 24) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }
  if (amount < 1 || amount > 25) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }

  const db = await getDb();
  const ip = clientIp(req);
  const rate = await checkAndConsumeRate(
    db,
    { visitorKey: `v:${visitorId}`, ipKey: `ip:${ip}` },
    amount,
  );
  if (!rate.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterSec: rate.retryAfterSec },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) },
      },
    );
  }

  let crits = 0;
  for (let i = 0; i < amount; i++) {
    if (Math.random() < CRIT_P) crits++;
  }
  const normals = amount - crits;
  const now = Date.now();

  const tx = await db.transaction("write");
  try {
    const existing = await tx.execute({
      sql: `SELECT total_bless, crit_bless FROM visitors WHERE id = ?`,
      args: [visitorId],
    });

    let totalBless: number;
    let critBless: number;

    if (existing.rows.length === 0) {
      await tx.execute({
        sql: `INSERT INTO visitors (id, display_name, total_bless, crit_bless, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [visitorId, displayName, amount, crits, now, now],
      });
      totalBless = amount;
      critBless = crits;
    } else {
      await tx.execute({
        sql: `UPDATE visitors SET display_name = ?, total_bless = total_bless + ?, crit_bless = crit_bless + ?, updated_at = ? WHERE id = ?`,
        args: [displayName, amount, crits, now, visitorId],
      });
      totalBless =
        Number(existing.rows[0]?.total_bless ?? 0) + amount;
      critBless = Number(existing.rows[0]?.crit_bless ?? 0) + crits;
    }

    const rankRow = await tx.execute({
      sql: `SELECT 1 + COUNT(*) AS r FROM visitors WHERE total_bless > ?`,
      args: [totalBless],
    });
    const rank = Number(rankRow.rows[0]?.r ?? 1);

    await tx.commit();

    return NextResponse.json({
      amount,
      critCount: crits,
      normalCount: normals,
      totalBless,
      critBless,
      rank,
      hadCrit: crits > 0,
    });
  } catch (e) {
    await tx.rollback().catch(() => {});
    console.error(e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
