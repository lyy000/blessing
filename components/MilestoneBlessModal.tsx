"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-title"
      className="milestone-overlay fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#2a1520]/55 backdrop-blur-md"
        aria-label="关闭"
        onClick={onClose}
      />
      <div className="milestone-card relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border-2 border-[#ffb7d5] bg-gradient-to-b from-[#fff8fb] via-white to-[#f3f8ff] p-8 shadow-[0_0_0_8px_rgba(255,183,213,0.25),0_32px_100px_rgba(199,91,140,0.35)]">
        <div className="milestone-confetti pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="confetti-piece absolute block h-2 w-2 rounded-sm"
              style={{
                left: `${(i * 17) % 100}%`,
                top: `${(i * 23) % 40}%`,
                background:
                  i % 3 === 0 ? "#ffb7d5" : i % 3 === 1 ? "#c9e4ff" : "#ffd6e8",
                animationDelay: `${(i % 8) * 0.05}s`,
              }}
            />
          ))}
        </div>

        <p className="relative text-center text-xs font-semibold tracking-[0.2em] text-[#c75b8c] uppercase">
          ✦ 百次祝福达成 ✦
        </p>
        <p
          id="milestone-title"
          className="relative mt-2 text-center font-display text-3xl text-[#c75b8c]"
        >
          已累计祈福 {milestone} 次
        </p>
        <div className="relative mx-auto mt-6 max-w-md rounded-2xl border border-[#ffe4ef] bg-white/80 px-5 py-6 shadow-inner">
          <p className="text-center text-lg leading-relaxed text-[color:var(--color-text)]">
            「{quote}」
          </p>
        </div>
        <p className="relative mt-4 text-center text-sm text-[color:var(--color-text-muted)]">
          愿曼桢感冒快快好起来
        </p>
        <button
          type="button"
          onClick={onClose}
          className="relative mt-8 w-full rounded-2xl bg-gradient-to-r from-[#ff9ec4] via-[#ffb7d5] to-[#ffc9e4] py-4 text-base font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]"
        >
          收下祝福，继续敲木鱼
        </button>
      </div>

      <style jsx global>{`
        @keyframes milestoneOverlayIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes milestoneCardIn {
          0% {
            opacity: 0;
            transform: scale(0.82) translateY(24px);
          }
          60% {
            transform: scale(1.04) translateY(-4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes confettiFall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(120px) rotate(360deg);
          }
        }
        @keyframes milestoneGlow {
          0%,
          100% {
            box-shadow: 0 0 0 8px rgba(255, 183, 213, 0.25),
              0 32px 100px rgba(199, 91, 140, 0.35);
          }
          50% {
            box-shadow: 0 0 0 14px rgba(255, 183, 213, 0.4),
              0 36px 110px rgba(199, 91, 140, 0.45);
          }
        }
        .milestone-overlay {
          animation: milestoneOverlayIn 0.35s ease-out forwards;
        }
        .milestone-card {
          animation: milestoneCardIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards,
            milestoneGlow 2s ease-in-out infinite 0.55s;
        }
        .confetti-piece {
          animation: confettiFall 1.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
