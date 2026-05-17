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
                ? "float-crit absolute top-[28%] text-xl font-bold tracking-wide text-[#ff4d8a] drop-shadow-[0_0_12px_rgba(255,158,196,0.8)]"
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
            opacity: 0;
            transform: translate(-50%, 8px) scale(0.6);
          }
          12% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1.15);
          }
          35% {
            transform: translate(-50%, -20px) scale(1.45);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -88px) scale(1.35);
          }
        }
        .float-normal {
          animation: floatUp 0.9s ease-out forwards;
        }
        .float-crit {
          animation: floatCrit 0.85s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
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
