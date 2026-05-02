"use client";

import { useEffect, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export type MobileKey = "left" | "right" | "jump";

type Props = {
  onPress: (key: MobileKey, down: boolean) => void;
};

export default function MobileControls({ onPress }: Props) {
  // Pulse for the first 3s after mount so first-time players notice the
  // controls. Disabled afterward so it doesn't keep moving while playing.
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

  const baseBtn =
    "grid place-items-center rounded-full border text-white shadow-lg backdrop-blur transition select-none active:scale-95";
  const pulseClass = showPulse ? "animate-touch-pulse" : "";
  const dpadStyle = {
    background: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.4)",
  } as const;
  const jumpStyle = {
    background: "rgba(245,197,24,0.2)",
    borderColor: "rgba(245,197,24,0.55)",
  } as const;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-5 z-30 flex items-end justify-between px-5 sm:bottom-6 sm:px-7"
      style={{ touchAction: "none" }}
    >
      <div className="pointer-events-auto flex gap-3">
        <button
          type="button"
          aria-label="Move left"
          className={`${baseBtn} ${pulseClass} h-[60px] w-[60px] text-2xl font-bold`}
          style={dpadStyle}
          {...bind("left")}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Move right"
          className={`${baseBtn} ${pulseClass} h-[60px] w-[60px] text-2xl font-bold`}
          style={dpadStyle}
          {...bind("right")}
        >
          →
        </button>
      </div>
      <div className="pointer-events-auto">
        <button
          type="button"
          aria-label="Jump"
          className={`${baseBtn} ${pulseClass} h-[68px] w-[68px] text-[10px] font-black uppercase tracking-[0.18em]`}
          style={jumpStyle}
          {...bind("jump")}
        >
          Jump
        </button>
      </div>
    </div>
  );
}
