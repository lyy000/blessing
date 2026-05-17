"use client";

import { TapRippleLayer, type TapRipple } from "@/components/TapRippleLayer";

type Props = {
  disabled: boolean;
  burst: "normal" | "crit" | null;
  tapPulse: number;
  ripples: TapRipple[];
  reduceMotion: boolean;
  onTap: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function WoodenFish({
  disabled,
  burst,
  tapPulse,
  ripples,
  reduceMotion,
  onTap,
}: Props) {
  const motionClass = [
    "fish-motion",
    !reduceMotion && burst === "normal" ? "fish-motion--hit" : "",
    !reduceMotion && burst === "crit" ? "fish-motion--crit" : "",
    !reduceMotion && tapPulse > 0 ? "fish-motion--tap" : "",
  ]
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

        {/* 柔光底座 */}
        <span
          className="fish-pedestal pointer-events-none absolute bottom-2 left-1/2 h-8 w-40 -translate-x-1/2 rounded-[100%] bg-[#ffb7d5]/25 blur-xl"
          aria-hidden
        />

        <span
          key={reduceMotion ? "static" : tapPulse}
          className={motionClass}
          aria-hidden
        >
          <span className="fish-shape">
            {/* 鱼尾 */}
            <span className="fish-tail" />
            {/* 鱼身主体 */}
            <span className="fish-body">
              <span className="fish-body-inner" />
              <span className="fish-shine" />
              <span className="fish-mouth" />
            </span>
          </span>
        </span>

        {burst === "crit" && !reduceMotion && (
          <span className="fish-crit-ring pointer-events-none absolute inset-6 rounded-[2.5rem]" />
        )}
      </span>

      <style jsx global>{`
        .fish-stage {
          perspective: 640px;
        }

        .fish-motion {
          display: block;
          transform: translateZ(0);
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        .wooden-fish-btn:not(:disabled):hover .fish-motion {
          transform: translateY(-3px) scale(1.03);
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

        .fish-crit-ring {
          animation: fishCritRing 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          box-shadow: 0 0 0 0 rgba(255, 158, 196, 0.55);
        }

        @keyframes fishTapSmooth {
          0% {
            transform: translateY(0) scale(1);
          }
          22% {
            transform: translateY(5px) scale(0.94);
          }
          55% {
            transform: translateY(-2px) scale(1.02);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fishHitSmooth {
          0% {
            transform: translateY(0) scale(1);
          }
          30% {
            transform: translateY(6px) scale(0.93);
          }
          65% {
            transform: translateY(-3px) scale(1.03);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fishCritSmooth {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
          20% {
            transform: translateY(5px) scale(0.9) rotate(-2deg);
          }
          45% {
            transform: translateY(-4px) scale(1.05) rotate(2deg);
          }
          70% {
            transform: translateY(1px) scale(0.98) rotate(-1deg);
          }
          100% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }

        @keyframes fishCritRing {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 158, 196, 0.65);
          }
          100% {
            box-shadow: 0 0 0 18px rgba(255, 158, 196, 0);
          }
        }

        .fish-motion--tap {
          animation: fishTapSmooth 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .fish-motion--hit {
          animation: fishHitSmooth 0.48s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .fish-motion--crit {
          animation: fishCritSmooth 0.58s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .fish-motion,
          .fish-motion--tap,
          .fish-motion--hit,
          .fish-motion--crit {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </button>
  );
}
