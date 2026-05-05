"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Level } from "@/lib/levels";
import Game from "@/components/Game";
import CaseStudyModal from "@/components/CaseStudyModal";

export default function PlayClient({ level }: { level: Level }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setIsTouch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const handleLevelComplete = useCallback(() => setModalOpen(true), []);
  const handleClose = useCallback(() => router.push("/#chapters"), [router]);
  const handleContinue = useCallback(() => {
    if (level.nextLevelSlug) {
      router.push(`/play/${level.nextLevelSlug}`);
    } else {
      router.push("/end");
    }
  }, [router, level.nextLevelSlug]);

  return (
    <div
      className={
        isTouch
          ? "fixed inset-0 overflow-hidden bg-black text-zinc-100 game-no-select"
          : "min-h-screen w-full bg-zinc-950 text-zinc-100 game-no-select"
      }
    >
      <Game key={level.slug} level={level} onLevelComplete={handleLevelComplete} />
      {modalOpen && (
        <CaseStudyModal
          level={level}
          onClose={handleClose}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
