"use client";

import { useEffect, useState } from "react";

// Shows a "rotate to play" overlay when the user is on a touch device in
// portrait orientation. Lets stubborn users dismiss with "play anyway".
export default function OrientationOverlay() {
  const [active, setActive] = useState(false);
  const [forceDismiss, setForceDismiss] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)");
    const portrait = window.matchMedia("(orientation: portrait)");

    const update = () => {
      setActive(coarse.matches && portrait.matches);
    };
    update();
    coarse.addEventListener("change", update);
    portrait.addEventListener("change", update);
    return () => {
      coarse.removeEventListener("change", update);
      portrait.removeEventListener("change", update);
    };
  }, []);

  if (!active || forceDismiss) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rotate your device to play"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-zinc-950 px-6 text-center text-zinc-100"
    >
      <div className="flex h-20 w-12 items-center justify-center rounded-md border-2 border-white/70 animate-rotate-phone">
        <div className="h-1 w-6 rounded-full bg-white/70" />
      </div>
      <div className="space-y-2">
        <h2 className="font-pixel text-base uppercase tracking-[0.2em] text-white">
          Rotate to Play
        </h2>
        <p className="font-mono text-xs text-zinc-400">
          this game plays best in landscape
        </p>
      </div>
      <button
        type="button"
        onClick={() => setForceDismiss(true)}
        className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 underline-offset-4 transition hover:text-zinc-200 hover:underline"
      >
        play in portrait anyway
      </button>
    </div>
  );
}
