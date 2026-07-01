"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import type { Level } from "@/lib/levels";
import { useMediaQuery } from "@/lib/useMediaQuery";

type Props = {
  level: Level;
  onClose: () => void;
  onContinue: () => void;
};

export default function CaseStudyModal({ level, onClose, onContinue }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const continueLabel = level.nextLevelSlug ? "Next level →" : "View final screen →";
  const isLandscapeMobile = useMediaQuery(
    "(orientation: landscape) and (max-height: 500px)"
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 backdrop-blur-sm sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-2xl"
        style={{
          borderTopColor: level.theme,
          borderTopWidth: 4,
          width: isLandscapeMobile
            ? "calc(100vw - 32px)"
            : "min(640px, calc(100vw - 32px))",
          maxWidth: "calc(100vw - 16px)",
          maxHeight: isLandscapeMobile
            ? "calc(100vh - 16px)"
            : "min(calc(100vh - 32px), calc(100dvh - 32px))",
        }}
      >
        {isLandscapeMobile ? (
          <LandscapeLayout
            level={level}
            continueLabel={continueLabel}
            onClose={onClose}
            onContinue={onContinue}
          />
        ) : (
          <PortraitLayout
            level={level}
            continueLabel={continueLabel}
            onClose={onClose}
            onContinue={onContinue}
          />
        )}
      </div>
    </div>
  );
}

function PortraitLayout({
  level,
  continueLabel,
  onClose,
  onContinue,
}: {
  level: Level;
  continueLabel: string;
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <>
      <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900 px-6 pb-4 pt-5 sm:px-8 sm:pt-6">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 sm:text-xs">
          Level Cleared · {level.company}
        </p>
        <h2
          id="case-study-title"
          className="text-xl font-black leading-tight tracking-tight sm:text-2xl"
        >
          {level.caseStudy.title}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8 sm:py-6">
        <div className="space-y-5 text-sm leading-relaxed sm:text-base">
          <Section label="Problem">{level.caseStudy.problem}</Section>
          <Section label="Approach">{level.caseStudy.approach}</Section>
          <Section label="Outcome">{level.caseStudy.outcome}</Section>
        </div>

        <MetricsRow level={level} />

        <BossesList level={level} />
      </div>

      <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t border-zinc-800 bg-zinc-900 px-6 py-4 min-[400px]:flex-row min-[400px]:justify-end sm:px-8">
        <FooterButtons
          onClose={onClose}
          onContinue={onContinue}
          continueLabel={continueLabel}
        />
      </div>
    </>
  );
}

function LandscapeLayout({
  level,
  continueLabel,
  onClose,
  onContinue,
}: {
  level: Level;
  continueLabel: string;
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="grid h-full min-h-0 grid-cols-2">
      {/* LEFT column: header + problem + approach */}
      <div className="flex min-h-0 flex-col border-r border-white/10">
        <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-3">
          <p
            id="case-study-title"
            className="mb-1 font-mono uppercase tracking-[0.3em] text-zinc-500"
            style={{ fontSize: 10 }}
          >
            Level Cleared · {level.company}
          </p>
          <h2 className="font-black leading-tight tracking-tight" style={{ fontSize: 18 }}>
            {level.caseStudy.title}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          <div className="space-y-4">
            <SectionTight label="Problem">{level.caseStudy.problem}</SectionTight>
            <SectionTight label="Approach">{level.caseStudy.approach}</SectionTight>
          </div>
        </div>
      </div>

      {/* RIGHT column: outcome + metrics + bosses + footer */}
      <div className="flex min-h-0 flex-col">
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          <div className="space-y-4">
            <SectionTight label="Outcome">{level.caseStudy.outcome}</SectionTight>
            <MetricsRow level={level} compact />
            <BossesList level={level} compact />
          </div>
        </div>
        <div className="flex flex-row justify-end gap-2 border-t border-zinc-800 bg-zinc-900 px-4 py-3">
          <FooterButtons
            onClose={onClose}
            onContinue={onContinue}
            continueLabel={continueLabel}
            compact
          />
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
        {label}
      </h3>
      <p className="text-zinc-200">{children}</p>
    </div>
  );
}

function SectionTight({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h3
        className="mb-1 font-bold uppercase tracking-[0.3em] text-zinc-500"
        style={{ fontSize: 10 }}
      >
        {label}
      </h3>
      <p className="text-zinc-200" style={{ fontSize: 12, lineHeight: 1.5 }}>
        {children}
      </p>
    </div>
  );
}

function MetricsRow({ level, compact = false }: { level: Level; compact?: boolean }) {
  return (
    <div className={compact ? "flex flex-wrap gap-1.5" : "mt-5 flex flex-wrap gap-2"}>
      {level.caseStudy.metrics.map((m) => (
        <span
          key={m}
          className="rounded-full font-semibold"
          style={{
            background: `${level.theme}26`,
            color: level.theme,
            border: `1px solid ${level.theme}80`,
            padding: compact ? "2px 8px" : "4px 12px",
            fontSize: compact ? 10 : 12,
          }}
        >
          {m}
        </span>
      ))}
    </div>
  );
}

function BossesList({ level, compact = false }: { level: Level; compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "border-t border-zinc-800 pt-3"
          : "mt-6 border-t border-zinc-800 pt-5"
      }
    >
      <h3
        className="mb-2 font-bold uppercase tracking-[0.3em] text-zinc-500"
        style={{ fontSize: compact ? 10 : 12 }}
      >
        Bosses
      </h3>
      <ul className={compact ? "space-y-1" : "space-y-2"}>
        {level.enemies.map((e) => (
          <li
            key={e.id}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
            style={{ fontSize: compact ? 11 : 14 }}
          >
            <span className="font-semibold text-zinc-100">{e.label}</span>
            <span className="text-zinc-400">— {e.solution}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterButtons({
  onClose,
  onContinue,
  continueLabel,
  compact = false,
}: {
  onClose: () => void;
  onContinue: () => void;
  continueLabel: string;
  compact?: boolean;
}) {
  const sizeClass = compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className={`rounded-md border border-zinc-700 bg-zinc-800/60 font-medium text-zinc-300 transition hover:bg-zinc-800 ${sizeClass}`}
      >
        Back to map
      </button>
      <button
        type="button"
        onClick={onContinue}
        className={`rounded-md bg-white font-bold text-zinc-900 transition hover:bg-zinc-100 ${sizeClass}`}
      >
        {continueLabel}
      </button>
    </>
  );
}
