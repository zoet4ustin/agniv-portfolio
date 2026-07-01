"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMediaQuery } from "@/lib/useMediaQuery";

const HOVER_CLOSE_DELAY_MS = 200;

// Sticky homepage logo. Hovering on desktop or tapping on mobile slides
// in a "visiting card" panel from the left edge of the viewport.
export default function AboutLogo() {
  const isTouch = useMediaQuery("(pointer: coarse)");
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const open = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(false);
  }, []);

  // 200 ms grace period on mouseleave so the cursor can travel from the
  // logo to the panel without flicker.
  const scheduleClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setIsOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  }, []);

  // Mobile: tap-outside-to-close.
  useEffect(() => {
    if (!isTouch || !isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (
        t?.closest?.("[data-about-panel]") ||
        t?.closest?.("[data-about-logo]")
      ) {
        return;
      }
      close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isTouch, isOpen, close]);

  // Esc closes the panel for keyboard accessibility.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Hover handlers only attach on non-touch devices to avoid accidental
  // openings from tap-and-drag.
  const hoverHandlers = isTouch
    ? {}
    : { onMouseEnter: open, onMouseLeave: scheduleClose };

  const onLogoClick = () => {
    if (isTouch) {
      setIsOpen((v) => !v);
    }
  };

  return (
    <>
      {/* Logo */}
      <button
        type="button"
        data-about-logo="true"
        aria-label={isOpen ? "Close about" : "Open about"}
        aria-expanded={isOpen}
        aria-controls="about-panel"
        onClick={onLogoClick}
        {...hoverHandlers}
        className="fixed left-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-md transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 sm:left-4 sm:top-4 sm:h-12 sm:w-12"
      >
        <Image
          src="/logo.png"
          alt="Agniv Kashyap"
          width={48}
          height={48}
          priority
          className="h-full w-full object-contain"
        />
      </button>

      {/* Panel */}
      <aside
        id="about-panel"
        data-about-panel="true"
        aria-hidden={!isOpen}
        {...hoverHandlers}
        className={`fixed left-0 top-1/2 z-40 -translate-y-1/2 transition-transform duration-[280ms] ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-[105%]"
        }`}
        style={{
          width: "min(360px, calc(100vw - 48px))",
          maxHeight: "calc(100vh - 32px)",
        }}
      >
        <div
          className="relative overflow-y-auto rounded-r-2xl border-y border-r border-white/10 bg-[#13131e] p-6 shadow-2xl"
          style={{ maxHeight: "calc(100vh - 32px)" }}
        >
          {/* Close × — visible on touch; harmless on desktop. */}
          {isTouch && (
            <button
              type="button"
              onClick={close}
              aria-label="Close about"
              className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-md text-base text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          )}

          {/* Photo */}
          <div className="mb-4 h-24 w-24 overflow-hidden rounded-xl border-2 border-white/10">
            <Image
              src="/about.jpg"
              alt="Agniv Kashyap"
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Name */}
          <h2 className="mb-1 font-pixel text-[22px] leading-[1.2] text-white">
            Agniv Kashyap
          </h2>

          {/* Tagline */}
          <p
            className="mb-4 font-mono italic text-zinc-200"
            style={{ fontSize: 14, opacity: 0.85 }}
          >
            From problems to product. Repeat.
          </p>

          <div className="mb-4 h-px bg-white/10" />

          {/* Role */}
          <div className="mb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
              Role
            </p>
            <p className="mt-0.5 font-mono text-[13px] text-white">
              Product Leader
            </p>
          </div>

          {/* Location */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
              Location
            </p>
            <p className="mt-0.5 font-mono text-[13px] text-white">
              New Delhi, India
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
