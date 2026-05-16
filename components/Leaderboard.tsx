"use client";

export type LeaderRow = {
  id: string;
  displayName: string;
  totalBless: number;
  critBless: number;
};

export function Leaderboard({
  rows,
  highlightId,
}: {
  rows: LeaderRow[];
  highlightId: string | null;
}) {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/55 p-6 shadow-[0_18px_50px_rgba(199,91,140,0.1)] backdrop-blur-md">
      <h2 className="font-display text-xl text-[#c75b8c]">
        温柔排行榜
      </h2>
      <ol className="mt-4 space-y-2">
        {rows.length === 0 && (
          <li className="text-sm text-[color:var(--color-text-muted)]">
            还没有数据，来做第一个吧～
          </li>
        )}
        {rows.map((row, i) => {
          const mine = highlightId && row.id === highlightId;
          return (
            <li
              key={row.id}
              className={[
                "flex items-center justify-between rounded-2xl px-3 py-2 text-sm",
                mine ? "bg-[#fff0f7] ring-1 ring-[#ffb7d5]" : "bg-white/50",
              ].join(" ")}
            >
              <span className="flex items-center gap-2">
                <span className="w-6 text-center text-[color:var(--color-text-muted)]">
                  {i + 1}
                </span>
                <span className="font-medium text-[color:var(--color-text)]">
                  {row.displayName}
                </span>
                {mine && (
                  <span className="rounded-full bg-[#ffd6e8] px-2 py-0.5 text-[10px] text-[#a0456b]">
                    我
                  </span>
                )}
              </span>
              <span className="text-[color:var(--color-text-muted)]">
                <span className="font-semibold text-[#c75b8c]">{row.totalBless}</span>{" "}
                次
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
