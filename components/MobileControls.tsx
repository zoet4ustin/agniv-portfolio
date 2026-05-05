"use client";

import { useEffect, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export type MobileKey = "left" | "right" | "jump";

type Props = {
  onPress: (key: MobileKey, down: boolean) => void;
};

export default function MobileControls({ onPress }: Props) {
  const [showPulse, setShowPulse] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setShowPulse(false), 3000);
    return () => window.clearTimeout(t);
  }, []);

  const bind = (key: MobileKey) => ({
    onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      onPress(key, true);
    },
    onPointerUp: (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onPress(key, false);
    },
    onPointerCancel: () => onPress(key, false),
    onPointerLeave: () => onPress(key, false),
    onContextMenu: (e: ReactPointerEvent<HTMLButtonElement>) => e.preventDefault(),
  });

  // Outer button = invisible tap area (88x88 dpad / 96x96 jump).
  // Inner span = visible circle (72x72 dpad / 80x80 jump).
  const outerBase =
    "grid place-items-center game-no-select active:scale-95 transition";
  const visibleBase =
    "grid place-items-center rounded-full border text-white shadow-lg backdrop-blur game-no-select";
  const dpadVisible =
    "bg-[rgba(255,255,255,0.10)] border-[rgba(255,255,255,0.30)] group-active:bg-[rgba(255,255,255,0.25)]";
  const jumpVisible =
    "bg-[rgba(245,197,24,0.18)] border-[rgba(245,197,24,0.45)] group-active:bg-[rgba(245,197,24,0.35)]";
  const pulseClass = showPulse ? "animate-touch-pulse" : "";

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between px-5 pb-5 game-no-select"
      style={{ touchAction: "none" }}
    >
      <div className="pointer-events-auto flex gap-3 game-no-select">
        <button
          type="button"
          aria-label="Move left"
          className={`group ${outerBase} h-22 w-22`}
          style={{ height: 88, width: 88, background: "transparent", border: "none" }}
          {...bind("left")}
        >
          <span
            className={`${visibleBase} ${dpadVisible} ${pulseClass} text-2xl font-bold`}
            style={{ height: 72, width: 72 }}
          >
            ←
          </span>
        </button>
        <button
          type="button"
          aria-label="Move right"
          className={`group ${outerBase}`}
          style={{ height: 88, width: 88, background: "transparent", border: "none" }}
          {...bind("right")}
        >
          <span
            className={`${visibleBase} ${dpadVisible} ${pulseClass} text-2xl font-bold`}
            style={{ height: 72, width: 72 }}
          >
            →
          </span>
        </button>
      </div>
      <div className="pointer-events-auto game-no-select">
        <button
          type="button"
          aria-label="Jump"
          className={`group ${outerBase}`}
          style={{ height: 96, width: 96, background: "transparent", border: "none" }}
          {...bind("jump")}
        >
          <span
            className={`${visibleBase} ${jumpVisible} ${pulseClass} text-[11px] font-black uppercase tracking-[0.18em]`}
            style={{ height: 80, width: 80 }}
          >
            Jump
          </span>
        </button>
      </div>
    </div>
  );
}
