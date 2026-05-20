import fs from "fs";
import path from "path";

export type PenalizedUser = {
  id: string;
  displayName: string;
  previousTotal: number;
  totalBless: number;
};

export type PenalizedAnnouncement = {
  updatedAt: string;
  note?: string;
  users: PenalizedUser[];
};

function getDataDirectory(): string {
  const custom = process.env.DATA_DIR?.trim();
  if (custom) {
    return path.isAbsolute(custom)
      ? custom
      : path.join(process.cwd(), custom);
  }
  return path.join(process.cwd(), "data");
}

export function readPenalizedAnnouncement(): PenalizedAnnouncement | null {
  const filePath = path.join(getDataDirectory(), "penalized-announcement.json");
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw) as PenalizedAnnouncement;
    if (!Array.isArray(data.users) || data.users.length === 0) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/** 公告里展示的短 ID（保留前后各一段） */
export function shortVisitorId(id: string): string {
  if (id.length <= 14) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}
