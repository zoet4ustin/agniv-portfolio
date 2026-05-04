"use client";

import Link from "next/link";
import { useEffect } from "react";
import { levels } from "@/lib/levels";
import { contact } from "@/lib/contact";

const TEASERS: Record<string, string> = {
  flipkart: "fraud, at the scale of a billion users",
  jupiter: "credit, payments, and trust",
  rozana: "₹300 Cr+ in rural commerce",
  cars24: "the chapter still being written",
};

// Per-level brand palette for the chapter cards.
const CARD_THEME: Record<
  string,
  { bg: string; numberColor: string; bodyColor: string; accentBorder?: string }
> = {
  flipkart: { bg: "#F8E831", numberColor: "#047BD5", bodyColor: "#047BD5" },
  jupiter: { bg: "#FC644F", numberColor: "#FFFFFF", bodyColor: "#FFFFFF" },
  rozana: { bg: "#FFFFFF", numberColor: "#DC2626", bodyColor: "#1A1A1A" },
  cars24: {
    bg: "#047BD5",
    numberColor: "#FFFFFF",
    bodyColor: "#FFFFFF",
    accentBorder: "#FF3B30",
  },
};

const SECTION_ORDER = ["#hero", "#story", "#chapters"];

export default function Home() {
  // ENTER / SPACE scrolls forward through the three sections.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;

      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
          return;
        }
        // Don't intercept ENTER on links/buttons — they have their own action.
        if (
          (tag === "A" || tag === "BUTTON") &&
          e.key === "Enter"
        ) {
          return;
        }
      }

      // Find the section currently most-visible in the viewport.
      const mid = window.innerHeight / 2;
      let currentIdx = 0;
      for (let i = 0; i < SECTION_ORDER.length; i++) {
        const el = document.querySelector(SECTION_ORDER[i]);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= mid) currentIdx = i;
      }
      const next = SECTION_ORDER[currentIdx + 1];
      if (next) {
        e.preventDefault();
        document.querySelector(next)?.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      <Link
        href="/resume"
        className="fixed right-4 top-4 z-50 rounded-md border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-300 backdrop-blur transition hover:border-white/40 hover:text-white sm:right-6 sm:top-6"
      >
        skip the game →
      </Link>

      <Hero />
      <Story />
      <LevelMap />
    </div>
  );
}

function PixelGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
      aria-hidden
    />
  );
}

function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-16"
    >
      <PixelGrid />
      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-500 sm:text-xs">
          Agniv Kashyap — Product, Played
        </p>

        <h1 className="mt-10 font-pixel text-3xl leading-[1.4] text-white sm:text-5xl md:text-6xl">
          A PRODUCT CAREER.
        </h1>
        <h2 className="mt-3 font-pixel text-2xl leading-[1.4] text-zinc-300 sm:text-4xl md:text-5xl">
          PLAYED, NOT LISTED.
        </h2>

        <a
          href="#story"
          className="group mt-14 inline-flex flex-col items-center gap-3"
          aria-label="Begin"
        >
          <span className="rounded-sm border border-white/30 bg-white/5 px-6 py-3 font-pixel text-xs uppercase tracking-[0.2em] text-amber-300 transition group-hover:border-amber-300 group-hover:bg-amber-300 group-hover:text-zinc-950 animate-press-start sm:text-sm">
            Press Start
          </span>
          <span className="font-pixel text-base text-amber-300 animate-caret" aria-hidden>
            ▼
          </span>
          <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            Enter ↵ to begin
          </span>
        </a>
      </div>
    </section>
  );
}

function Story() {
  const lines = [
    "Most resumes lose users between intent and action.",
    "Mine is a level you can walk through.",
    "Every problem is real.",
    "Every solution shipped.",
    "The last level is still being written.",
  ];
  return (
    <section
      id="story"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-24"
    >
      <PixelGrid />
      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-500 sm:text-xs">
          The Story
        </p>

        <div className="mt-10 space-y-5 sm:space-y-6">
          {lines.map((line, i) => (
            <p
              key={line}
              className="font-pixel text-sm leading-[1.7] text-zinc-100 animate-fade-up sm:text-lg md:text-xl"
              style={{ animationDelay: `${0.1 + i * 0.18}s` }}
            >
              {line}
            </p>
          ))}
        </div>

        <p
          className="mt-12 font-mono text-sm text-zinc-400 animate-fade-up sm:text-base"
          style={{ animationDelay: "1.1s" }}
        >
          — Agniv Kashyap
        </p>

        <a
          href="#chapters"
          className="mt-14 inline-block rounded-sm border border-white/30 bg-white/5 px-5 py-3 font-pixel text-[10px] uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-zinc-950 sm:text-xs"
        >
          Begin →
        </a>
      </div>
    </section>
  );
}

function LevelMap() {
  return (
    <section
      id="chapters"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-24"
    >
      <PixelGrid />
      <DottedPath />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-500 sm:text-xs">
          Choose a Chapter
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {levels.map((level, i) => (
            <LevelCard
              key={level.slug}
              index={i}
              slug={level.slug}
              name={level.locationName}
              company={level.company}
              teaser={TEASERS[level.slug] ?? ""}
              isCurrent={level.isCurrentlyPlaying ?? false}
            />
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/play/skills"
            className="group flex items-center gap-4 rounded-md border border-zinc-800 bg-zinc-900/60 p-5 transition hover:-translate-y-0.5 hover:border-purple-500/60 hover:bg-zinc-900"
          >
            <div
              className="h-12 w-12 shrink-0 rounded-sm border border-black/30"
              style={{ background: "#A855F7" }}
              aria-hidden
            />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                Bonus Stage
              </div>
              <div className="font-pixel text-sm text-white sm:text-base">
                Skills Tree
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4 rounded-md border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-amber-400/60">
            <div
              className="h-12 w-12 shrink-0 rounded-sm border border-black/30"
              style={{ background: "#F59E0B" }}
              aria-hidden
            />
            <div className="flex-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                End Boss · You
              </div>
              <div className="font-pixel text-sm text-white sm:text-base">
                Get In Touch
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]">
                <a
                  href={`mailto:${contact.email}`}
                  className="text-amber-300 underline-offset-4 hover:underline"
                >
                  {contact.email}
                </a>
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 underline-offset-4 hover:underline"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LevelCard({
  index,
  slug,
  name,
  company,
  teaser,
  isCurrent,
}: {
  index: number;
  slug: string;
  name: string;
  company: string;
  teaser: string;
  isCurrent: boolean;
}) {
  const palette = CARD_THEME[slug] ?? {
    bg: "#1F1F1F",
    numberColor: "#FFFFFF",
    bodyColor: "#FFFFFF",
  };

  return (
    <Link
      href={`/play/${slug}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-md p-5 transition hover:-translate-y-1"
      style={{
        background: palette.bg,
        boxShadow: isCurrent
          ? `0 0 0 2px ${palette.accentBorder ?? "#FF3B30"}, 0 0 24px -4px ${
              palette.accentBorder ?? "#FF3B30"
            }aa`
          : "0 0 0 1px rgba(0,0,0,0.15)",
        animation: isCurrent ? "blinkFast 1.8s steps(1, end) infinite" : undefined,
      }}
    >
      <div
        className="font-pixel text-xs leading-none"
        style={{ color: palette.numberColor }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
      <div
        className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-70"
        style={{ color: palette.bodyColor }}
      >
        Chapter {index + 1}
      </div>
      <div
        className="font-pixel text-sm leading-[1.4] sm:text-base"
        style={{ color: palette.bodyColor }}
      >
        {name}
      </div>
      <div
        className="font-mono text-xs opacity-80"
        style={{ color: palette.bodyColor }}
      >
        {company}
      </div>
      <div
        className="font-mono text-[12px] leading-snug"
        style={{ color: palette.bodyColor }}
      >
        {teaser}
      </div>

      {isCurrent && (
        <span
          className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
          style={{
            background: "rgba(0,0,0,0.18)",
            color: palette.bodyColor,
            border: `1px solid ${palette.accentBorder ?? "rgba(255,255,255,0.4)"}`,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: palette.accentBorder ?? "#FF3B30" }}
          />
          Now Playing
        </span>
      )}
    </Link>
  );
}

function DottedPath() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-1/2 z-0 hidden -translate-y-1/2 lg:block"
      viewBox="0 0 1200 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M 80 50 C 280 10, 480 90, 680 50 S 1080 10, 1120 50"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2"
        strokeDasharray="2 6"
        strokeLinecap="round"
      />
    </svg>
  );
}
