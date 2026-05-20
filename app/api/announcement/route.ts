import { NextResponse } from "next/server";
import {
  readPenalizedAnnouncement,
  shortVisitorId,
} from "@/lib/penalizedAnnouncement";

export const runtime = "nodejs";

export async function GET() {
  const data = readPenalizedAnnouncement();
  if (!data) {
    return NextResponse.json({ active: false });
  }

  return NextResponse.json({
    active: true,
    updatedAt: data.updatedAt,
    users: data.users.map((u) => ({
      id: u.id,
      displayName: u.displayName,
      shortId: shortVisitorId(u.id),
      previousTotal: u.previousTotal,
      totalBless: u.totalBless,
    })),
  });
}
