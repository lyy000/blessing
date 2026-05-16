"use client";

type Props = {
  open: boolean;
  quote: string;
  milestone: number;
  onClose: () => void;
};

export function MilestoneBlessModal({
  open,
  quote,
  milestone,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#2a1520]/40 backdrop-blur-sm"
        aria-label="关闭"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/80 bg-gradient-to-b from-[#fff8fb] to-[#f3f8ff] p-8 shadow-[0_24px_80px_rgba(199,91,140,0.25)]">
        <p
          id="milestone-title"
          className="text-center text-sm font-medium text-[#c75b8c]"
        >
          已累计祈福 {milestone} 次
        </p>
        <p className="mt-4 text-center font-display text-xl leading-relaxed text-[color:var(--color-text)]">
          {quote}
        </p>
        <p className="mt-3 text-center text-sm text-[color:var(--color-text-muted)]">
          愿曼桢感冒快快好起来
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#ffb7d5] to-[#ffc9e4] py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105 active:scale-[0.98]"
        >
          收下祝福，继续敲木鱼
        </button>
      </div>
    </div>
  );
}
