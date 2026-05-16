import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { milestonesForTotal, primaryEncouragement } from "@/lib/messages";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDb();
  const sum = await db.execute({
    sql: `SELECT COALESCE(SUM(total_bless), 0) AS g FROM visitors`,
  });
  const globalTotal = Number(sum.rows[0]?.g ?? 0);
  const visitorCount = await db.execute({
    sql: `SELECT COUNT(*) AS c FROM visitors`,
  });
  const totalVisitors = Number(visitorCount.rows[0]?.c ?? 0);

  return NextResponse.json({
    globalTotal,
    totalVisitors,
    encouragement: primaryEncouragement(globalTotal),
    milestones: milestonesForTotal(globalTotal),
  });
}
