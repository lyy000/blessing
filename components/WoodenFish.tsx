"use client";

import { TapRippleLayer, type TapRipple } from "@/components/TapRippleLayer";

type Props = {
  disabled: boolean;
  burst: "normal" | "crit" | null;
  tapPulse: number;
  critPulse: number;
  ripples: TapRipple[];
  reduceMotion: boolean;
  onTap: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

function CritBurstFX({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span className="fish-crit-fx pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      <span className="fish-crit-flash" />
      <span className="fish-crit-ring fish-crit-ring--a" />
      <span className="fish-crit-ring fish-crit-ring--b" />
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          className="fish-crit-spark"
          style={{ ["--spark-i" as string]: i }}
        />
      ))}
    </span>
  );
}

export function WoodenFish({
  disabled,
  burst,
  tapPulse,
  critPulse,
  ripples,
  reduceMotion,
  onTap,
}: Props) {
  const isCrit = burst === "crit" && !reduceMotion;
  const isTapOnly = !isCrit && tapPulse > 0 && !reduceMotion;

  const motionClass = [
    "fish-motion",
    isCrit ? "fish-motion--crit" : "",
    isTapOnly ? "fish-motion--tap" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const bodyClass = ["fish-body", isCrit ? "fish-body--crit" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onTap}
      aria-label="敲木鱼祈福"
      className={[
        "wooden-fish-btn group relative flex h-56 w-72 items-center justify-center border-0 bg-transparent p-0",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb7d5] focus-visible:ring-offset-4",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      <span className="fish-stage relative flex h-48 w-full max-w-[280px] items-center justify-center">
        <TapRippleLayer ripples={ripples} />

        <span
          className="fish-pedestal pointer-events-none absolute bottom-2 left-1/2 h-8 w-40 -translate-x-1/2 rounded-[100%] bg-[#ffb7d5]/25 blur-xl"
          aria-hidden
        />

        <CritBurstFX key={critPulse} active={isCrit} />

        <span
          key={isCrit ? `crit-${critPulse}` : `tap-${tapPulse}`}
          className={motionClass}
          aria-hidden
        >
          <span className="fish-shape">
            <span className="fish-tail" />
            <span className={bodyClass}>
              <span className="fish-body-inner" />
              <span className="fish-shine" />
              <span className="fish-mouth" />
            </span>
          </span>
        </span>
      </span>

      <style jsx global>{`
        .fish-stage {
          perspective: 720px;
        }

        .fish-motion {
          display: block;
          transform: translate3d(0, 0, 0);
          will-change: transform, filter;
        }

        .wooden-fish-btn:not(:disabled):hover .fish-motion:not(.fish-motion--crit) {
          transform: translate3d(0, -3px, 0) scale(1.03);
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fish-shape {
          position: relative;
          display: block;
          width: 168px;
          height: 118px;
        }

        .fish-body {
          position: absolute;
          left: 8px;
          top: 14px;
          width: 132px;
          height: 92px;
          border-radius: 58% 62% 55% 48% / 52% 54% 46% 48%;
          background: linear-gradient(
            145deg,
            #f3d4a8 0%,
            #e2b67a 38%,
            #c99558 72%,
            #b8844f 100%
          );
          box-shadow:
            inset 0 10px 18px rgba(255, 248, 235, 0.65),
            inset 0 -14px 22px rgba(140, 88, 48, 0.22),
            0 18px 36px rgba(180, 120, 80, 0.28),
            0 4px 10px rgba(199, 91, 140, 0.12);
          transition: filter 0.2s ease, box-shadow 0.2s ease;
        }

        .fish-body--crit {
          animation: fishBodyCritGlow 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .fish-body-inner {
          position: absolute;
          inset: 10px 14px 12px 18px;
          border-radius: inherit;
          background: linear-gradient(
            160deg,
            rgba(255, 240, 220, 0.35) 0%,
            rgba(255, 255, 255, 0) 55%
          );
        }

        .fish-shine {
          position: absolute;
          left: 22px;
          top: 16px;
          width: 44px;
          height: 28px;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 252, 245, 0.9) 0%,
            rgba(255, 252, 245, 0) 70%
          );
          opacity: 0.85;
        }

        .fish-mouth {
          position: absolute;
          left: 6px;
          top: 28px;
          width: 36px;
          height: 44px;
          border-radius: 52% 48% 50% 50%;
          background: linear-gradient(
            135deg,
            #9a6b42 0%,
            #7a5234 55%,
            #6b462c 100%
          );
          box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.15);
          opacity: 0.88;
        }

        .fish-tail {
          position: absolute;
          right: 0;
          top: 36px;
          width: 44px;
          height: 52px;
          border-radius: 0 70% 65% 0;
          background: linear-gradient(160deg, #ddb078 0%, #c99558 100%);
          box-shadow:
            inset -4px 0 8px rgba(255, 235, 210, 0.35),
            4px 8px 14px rgba(140, 88, 48, 0.18);
          transform: rotate(-6deg);
        }

        /* —— 暴击光效层 —— */
        .fish-crit-flash {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 200, 220, 0.75) 0%,
            rgba(255, 183, 213, 0.35) 35%,
            transparent 68%
          );
          animation: critFlash 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .fish-crit-ring {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 3px solid rgba(255, 140, 180, 0.85);
          animation: critRing 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .fish-crit-ring--b {
          animation-delay: 0.08s;
          border-color: rgba(255, 220, 180, 0.7);
        }

        .fish-crit-spark {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fff8fb, #ff9ec4);
          box-shadow: 0 0 10px rgba(255, 158, 196, 0.9);
          animation: critSpark 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: calc(var(--spark-i) * 0.02s);
          transform: rotate(calc(var(--spark-i) * 45deg)) translateY(-72px);
          opacity: 0;
        }

        @keyframes critFlash {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          18% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 0;
            transform: scale(1.35);
          }
        }

        @keyframes critRing {
          0% {
            opacity: 0.9;
            transform: scale(0.55);
          }
          100% {
            opacity: 0;
            transform: scale(1.65);
          }
        }

        @keyframes critSpark {
          0% {
            opacity: 0;
            transform: rotate(calc(var(--spark-i) * 45deg)) translateY(-20px) scale(0.4);
          }
          25% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: rotate(calc(var(--spark-i) * 45deg)) translateY(-96px) scale(1.1);
          }
        }

        @keyframes fishBodyCritGlow {
          0% {
            filter: brightness(1);
            box-shadow:
              inset 0 10px 18px rgba(255, 248, 235, 0.65),
              inset 0 -14px 22px rgba(140, 88, 48, 0.22),
              0 18px 36px rgba(180, 120, 80, 0.28);
          }
          25% {
            filter: brightness(1.22) saturate(1.15);
            box-shadow:
              inset 0 10px 18px rgba(255, 248, 235, 0.8),
              0 0 28px rgba(255, 158, 196, 0.65),
              0 18px 36px rgba(199, 91, 140, 0.35);
          }
          100% {
            filter: brightness(1);
            box-shadow:
              inset 0 10px 18px rgba(255, 248, 235, 0.65),
              inset 0 -14px 22px rgba(140, 88, 48, 0.22),
              0 18px 36px rgba(180, 120, 80, 0.28);
          }
        }

        @keyframes fishTapSmooth {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          28% {
            transform: translate3d(0, 5px, 0) scale(0.94);
          }
          62% {
            transform: translate3d(0, -2px, 0) scale(1.02);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        /* 暴击：一次连贯的「压下 → 弹起 → 落定」，与光效同时长 */
        @keyframes fishCritSmooth {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          14% {
            transform: translate3d(0, 6px, 0) scale(0.9);
          }
          32% {
            transform: translate3d(0, -8px, 0) scale(1.1);
          }
          52% {
            transform: translate3d(0, -2px, 0) scale(1.06);
          }
          72% {
            transform: translate3d(0, 2px, 0) scale(0.98);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        .fish-motion--tap {
          animation: fishTapSmooth 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .fish-motion--crit {
          animation: fishCritSmooth 0.72s cubic-bezier(0.34, 1.25, 0.64, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .fish-motion,
          .fish-motion--tap,
          .fish-motion--crit,
          .fish-crit-fx,
          .fish-body--crit {
            animation: none !important;
          }
        }
      `}</style>
    </button>
  );
}
