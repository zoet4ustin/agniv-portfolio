"use client";

import type { PointerEvent as ReactPointerEvent } from "react";

export type MobileKey = "left" | "right" | "jump";

type Props = {
  onPress: (key: MobileKey, down: boolean) => void;
};

export default function MobileControls({ onPress }: Props) {
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

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex items-end justify-between px-4 sm:px-6"
      style={{ touchAction: "none" }}
    >
      <div className="pointer-events-auto flex gap-3">
        <button
          type="button"
          aria-label="Move left"
          className="grid h-14 w-14 place-items-center rounded-full border border-white/30 bg-black/55 text-2xl font-bold text-white shadow-lg backdrop-blur active:bg-black/80"
          {...bind("left")}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Move right"
          className="grid h-14 w-14 place-items-center rounded-full border border-white/30 bg-black/55 text-2xl font-bold text-white shadow-lg backdrop-blur active:bg-black/80"
          {...bind("right")}
        >
          →
        </button>
      </div>
      <div className="pointer-events-auto">
        <button
          type="button"
          aria-label="Jump"
          className="grid h-16 w-16 place-items-center rounded-full border border-white/30 bg-emerald-500/80 text-xs font-black uppercase tracking-widest text-white shadow-lg backdrop-blur active:bg-emerald-600"
          {...bind("jump")}
        >
          Jump
        </button>
      </div>
    </div>
  );
}
