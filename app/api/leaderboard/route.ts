import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isValidVisitorId } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const limitRaw = req.nextUrl.searchParams.get("limit");
  const limit = Math.min(
    50,
    Math.max(1, limitRaw ? parseInt(limitRaw, 10) || 20 : 20),
  );
  const visitorId = req.nextUrl.searchParams.get("visitorId") ?? "";

  const db = await getDb();
  const res = await db.execute({
    sql: `SELECT id, display_name, total_bless, crit_bless FROM visitors WHERE total_bless > 0 ORDER BY total_bless DESC, updated_at ASC LIMIT ?`,
    args: [limit],
  });

  const rows = res.rows.map((r) => ({
    id: String(r.id),
    displayName: String(r.display_name),
    totalBless: Number(r.total_bless ?? 0),
    critBless: Number(r.crit_bless ?? 0),
  }));

  let me: (typeof rows)[number] | null = null;
  let myRank: number | null = null;

  if (isValidVisitorId(visitorId)) {
    const mine = await db.execute({
      sql: `SELECT id, display_name, total_bless, crit_bless FROM visitors WHERE id = ?`,
      args: [visitorId],
    });
    if (mine.rows[0]) {
      const totalBless = Number(mine.rows[0].total_bless ?? 0);
      me = {
        id: String(mine.rows[0].id),
        displayName: String(mine.rows[0].display_name),
        totalBless,
        critBless: Number(mine.rows[0].crit_bless ?? 0),
      };
      const r = await db.execute({
        sql: `SELECT 1 + COUNT(*) AS r FROM visitors WHERE total_bless > ?`,
        args: [totalBless],
      });
      myRank = Number(r.rows[0]?.r ?? 1);
    }
  }

  return NextResponse.json({ leaderboard: rows, me, myRank });
}
