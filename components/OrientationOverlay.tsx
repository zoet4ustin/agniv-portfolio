"use client";

import { useEffect, useState } from "react";

// Hard-blocks portrait gameplay on touch devices. The "play anyway" escape
// hatch was removed deliberately — properly supporting portrait would mean
// shipping a second layout.
export default function OrientationOverlay() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)");
    const portrait = window.matchMedia("(orientation: portrait)");

    const update = () => setActive(coarse.matches && portrait.matches);
    update();
    coarse.addEventListener("change", update);
    portrait.addEventListener("change", update);
    return () => {
      coarse.removeEventListener("change", update);
      portrait.removeEventListener("change", update);
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rotate your device to play"
      aria-hidden={!active}
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-zinc-950 px-6 text-center text-zinc-100 transition-opacity duration-300 ${
        active ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex h-20 w-12 items-center justify-center rounded-md border-2 border-white/70 animate-rotate-phone">
        <div className="h-1 w-6 rounded-full bg-white/70" />
      </div>
      <div className="space-y-2">
        <h2 className="font-pixel text-base uppercase tracking-[0.2em] text-white">
          Rotate to Play
        </h2>
        <p className="font-mono text-xs text-zinc-400">
          this game is built for landscape
        </p>
      </div>
    </div>
  );
}
