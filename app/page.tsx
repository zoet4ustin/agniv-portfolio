import Link from "next/link";
import { levels } from "@/lib/levels";

const bonusCards = [
  {
    slug: "skills",
    title: "Skills Tree",
    subtitle: "Bonus stage",
    theme: "#A855F7",
  },
  {
    slug: "contact",
    title: "Contact",
    subtitle: "Send a coin",
    theme: "#F59E0B",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />

      <Link
        href="/resume"
        className="absolute right-4 top-4 z-10 rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 font-mono text-xs uppercase tracking-wider text-zinc-300 backdrop-blur transition hover:border-zinc-500 hover:text-white sm:right-8 sm:top-8"
      >
        Skip the game, see resume →
      </Link>

      <main className="relative z-0 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-24">
        <header className="mb-16 text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-zinc-500">
            Press Start
          </p>
          <h1 className="mb-3 text-5xl font-black tracking-tight text-white sm:text-6xl md:text-7xl">
            Agniv Kashyap
          </h1>
          <p className="font-mono text-base text-zinc-400 sm:text-lg">
            A Product Career, Played
          </p>
        </header>

        <section className="w-full">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
            World Map · Levels
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {levels.map((level, i) => (
              <Link
                key={level.slug}
                href={`/play/${level.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 transition hover:-translate-y-0.5 hover:border-zinc-600 hover:bg-zinc-900"
              >
                <div
                  className="mb-4 h-24 w-full rounded-md border border-black/30"
                  style={{ background: level.theme }}
                  aria-hidden
                />
                <div className="mb-1 font-mono text-xs uppercase tracking-widest text-zinc-500">
                  Level {i + 1}
                </div>
                <div className="mb-1 text-lg font-bold text-white">
                  {level.locationName}
                </div>
                <div className="mb-3 text-sm text-zinc-400">{level.company}</div>
                {level.isCurrentlyPlaying && (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-sm bg-red-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-red-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                    Now Playing
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 w-full">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
            Bonus Stages
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {bonusCards.map((card) => (
              <Link
                key={card.slug}
                href={`/play/${card.slug}`}
                className="group flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 transition hover:-translate-y-0.5 hover:border-zinc-600 hover:bg-zinc-900"
              >
                <div
                  className="h-12 w-12 shrink-0 rounded-md border border-black/30"
                  style={{ background: card.theme }}
                  aria-hidden
                />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {card.subtitle}
                  </div>
                  <div className="text-lg font-bold text-white">{card.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-16 font-mono text-xs text-zinc-600">
          © {new Date().getFullYear()} · Built with pixels and product sense
        </footer>
      </main>
    </div>
  );
}
