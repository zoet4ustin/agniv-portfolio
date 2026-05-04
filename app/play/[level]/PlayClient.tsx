"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Level } from "@/lib/levels";
import Game from "@/components/Game";
import CaseStudyModal from "@/components/CaseStudyModal";
import OrientationOverlay from "@/components/OrientationOverlay";

export default function PlayClient({ level }: { level: Level }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

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
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      <OrientationOverlay />
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
