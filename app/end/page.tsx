import Link from "next/link";

export default function EndPage() {
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
      <main className="relative z-0 mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.4em] text-zinc-500">
          Final Screen
        </p>
        <h1 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Run cleared
        </h1>
        <p className="mb-10 max-w-md font-mono text-sm text-zinc-400">
          You played through the career. The proper end screen — credits,
          contact, replay — lands in the next prompt.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-2 font-mono text-xs uppercase tracking-widest text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            ← Back to World Map
          </Link>
          <Link
            href="/resume"
            className="rounded-md bg-white px-4 py-2 font-mono text-xs uppercase tracking-widest text-zinc-900 transition hover:bg-zinc-100"
          >
            See resume →
          </Link>
        </div>
      </main>
    </div>
  );
}
