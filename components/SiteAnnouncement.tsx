"use client";

import { useEffect, useState } from "react";

type AnnouncementPayload = {
  active: boolean;
  updatedAt?: string;
  users?: {
    id: string;
    displayName: string;
    shortId: string;
    previousTotal: number;
    totalBless: number;
  }[];
};

export function SiteAnnouncement() {
  const [data, setData] = useState<AnnouncementPayload | null>(null);

  useEffect(() => {
    void fetch("/api/announcement")
      .then((r) => r.json() as Promise<AnnouncementPayload>)
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data?.active || !data.users?.length) return null;

  return (
    <aside
      className="rounded-[1.75rem] border border-[#ffd6e8]/90 bg-gradient-to-br from-[#fff8fb] via-white/90 to-[#f5f9ff] px-5 py-5 shadow-[0_12px_40px_rgba(199,91,140,0.12)]"
      role="note"
    >
      <p className="text-center text-sm font-semibold tracking-wide text-[#c75b8c]">
        站点公告
      </p>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[color:var(--color-text)]">
        <p>
          我们发现部分用户使用了<strong>连点器</strong>等工具异常刷取祈福数据，这与本页「为曼桢送一份真心祝福」的初衷不符。
        </p>
        <p>
          经查，以下账号的累计祈福已调整为<strong>负数</strong>（不再计入正常排行）：
        </p>
        <ul className="space-y-2 rounded-2xl bg-white/70 px-4 py-3 text-[13px]">
          {data.users.map((u) => (
            <li key={u.id} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
              <span>
                <span className="font-medium text-[#a65c7a]">{u.displayName}</span>
                <span className="ml-2 font-mono text-xs text-[color:var(--color-text-muted)]">
                  ID {u.shortId}
                </span>
              </span>
              <span className="text-[color:var(--color-text-muted)]">
                原 {u.previousTotal.toLocaleString()} 次 → 现{" "}
                <span className="font-semibold text-[#7aa6e8]">
                  {u.totalBless.toLocaleString()}
                </span>{" "}
                次
              </span>
            </li>
          ))}
        </ul>
        <p className="text-[color:var(--color-text-muted)]">
          希望大家本着美好的初心来祈福——也没见过哪座寺庙里，会摆一台自动敲木鱼的机器呀。
        </p>
        <p className="text-center text-xs text-[color:var(--color-text-muted)]">
          若误伤正常用户，请联系站主核实。
        </p>
      </div>
    </aside>
  );
}
