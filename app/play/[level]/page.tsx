import Link from "next/link";
import { getLevel } from "@/lib/levels";

export default async function PlayLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const data = getLevel(level);
  const heading = data ? data.locationName : level;

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />

      <main className="relative z-0 mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        {data && (
          <div
            className="mb-8 h-32 w-full max-w-md rounded-lg border border-black/30"
            style={{ background: data.theme }}
            aria-hidden
          />
        )}
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.4em] text-zinc-500">
          Loading Level
        </p>
        <h1 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Level: {heading}
        </h1>
        <p className="mb-10 font-mono text-sm text-zinc-400">
          coming soon
        </p>
        <Link
          href="/"
          className="rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-2 font-mono text-xs uppercase tracking-widest text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          ← Back to World Map
        </Link>
      </main>
    </div>
  );
}
