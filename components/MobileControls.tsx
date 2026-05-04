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

  const baseBtn =
    "grid place-items-center rounded-full border text-white shadow-lg backdrop-blur transition select-none active:scale-95";
  const dpadBtn =
    "bg-[rgba(255,255,255,0.10)] border-[rgba(255,255,255,0.30)] active:bg-[rgba(255,255,255,0.25)]";
  const jumpBtn =
    "bg-[rgba(245,197,24,0.18)] border-[rgba(245,197,24,0.45)] active:bg-[rgba(245,197,24,0.35)]";
  const pulseClass = showPulse ? "animate-touch-pulse" : "";

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between px-4 pb-4"
      style={{ touchAction: "none" }}
    >
      <div className="pointer-events-auto flex gap-2">
        <button
          type="button"
          aria-label="Move left"
          className={`${baseBtn} ${dpadBtn} ${pulseClass} h-14 w-14 text-2xl font-bold`}
          {...bind("left")}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Move right"
          className={`${baseBtn} ${dpadBtn} ${pulseClass} h-14 w-14 text-2xl font-bold`}
          {...bind("right")}
        >
          →
        </button>
      </div>
      <div className="pointer-events-auto">
        <button
          type="button"
          aria-label="Jump"
          className={`${baseBtn} ${jumpBtn} ${pulseClass} h-14 w-14 text-[10px] font-black uppercase tracking-[0.18em]`}
          {...bind("jump")}
        >
          Jump
        </button>
      </div>
    </div>
  );
}
