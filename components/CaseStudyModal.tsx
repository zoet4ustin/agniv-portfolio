"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import type { Level } from "@/lib/levels";

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
  const hasOngoing = level.enemies.some((e) => e.isCurrentBattle);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        className="relative my-6 w-full max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-100 shadow-2xl sm:my-8 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        style={{ borderTopColor: level.theme, borderTopWidth: 4 }}
      >
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
          Level Cleared · {level.company}
        </p>
        <h2
          id="case-study-title"
          className="mb-6 text-2xl font-black tracking-tight sm:text-3xl"
        >
          {level.caseStudy.title}
        </h2>

        <div className="space-y-5 text-sm leading-relaxed sm:text-base">
          <Section label="Problem">{level.caseStudy.problem}</Section>
          <Section label="Approach">{level.caseStudy.approach}</Section>
          <Section label="Outcome">{level.caseStudy.outcome}</Section>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {level.caseStudy.metrics.map((m) => (
            <span
              key={m}
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: `${level.theme}26`,
                color: level.theme,
                border: `1px solid ${level.theme}80`,
              }}
            >
              {m}
            </span>
          ))}
        </div>

        {hasOngoing && (
          <p className="mt-4 text-sm italic text-zinc-300">
            Some problems aren&apos;t solved yet. That&apos;s where you come in.
          </p>
        )}

        <div className="mt-6 border-t border-zinc-800 pt-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            Bosses
          </h3>
          <ul className="space-y-2">
            {level.enemies.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm"
              >
                <span className="font-semibold text-zinc-100">{e.label}</span>
                <span className="text-zinc-400">— {e.solution}</span>
                {e.isCurrentBattle && (
                  <span className="rounded-full border border-red-500/60 bg-red-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-red-300">
                    Still Fighting
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
          >
            Back to map
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-md bg-white px-4 py-2 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100"
          >
            {continueLabel}
          </button>
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
