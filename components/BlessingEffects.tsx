"use client";

export type FloatingTag = {
  id: number;
  kind: "normal" | "crit";
  text: string;
  offsetX?: number;
};

export function BlessingFloatLayer({
  items,
  reduceMotion,
}: {
  items: FloatingTag[];
  reduceMotion: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
      {items.map((f) => (
        <span
          key={f.id}
          className={
            reduceMotion
              ? "float-soft absolute left-1/2 top-1/3 text-base font-semibold text-[#c75b8c]"
              : f.kind === "crit"
                ? "float-crit absolute top-1/3 text-lg font-bold text-[#ff6b9d]"
                : "float-normal absolute top-1/3 text-base font-semibold text-[#c75b8c]"
          }
          style={{
            left: `calc(50% + ${f.offsetX ?? 0}px)`,
            transform: "translateX(-50%)",
          }}
        >
          {f.text}
        </span>
      ))}
      <style jsx global>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -64px) scale(1.15);
          }
        }
        @keyframes floatCrit {
          0% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1) rotate(-6deg);
            filter: drop-shadow(0 0 12px #ffb7d5);
          }
          40% {
            transform: translate(-50%, -16px) scale(1.35) rotate(6deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -80px) scale(1.4) rotate(0deg);
          }
        }
        .float-normal {
          animation: floatUp 0.9s ease-out forwards;
        }
        .float-crit {
          animation: floatCrit 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes floatSoft {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .float-soft {
          animation: floatSoft 0.55s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
