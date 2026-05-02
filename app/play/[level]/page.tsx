import Link from "next/link";
import { getLevel, type Level } from "@/lib/levels";
import PlayClient from "./PlayClient";

const KNOWN_BONUS = new Set(["skills", "contact"]);

export default async function PlayLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: slug } = await params;
  const level = getLevel(slug);

  if (level && level.slug === "flipkart") {
    return <PlayClient level={level} />;
  }

  if (level) {
    return <ComingSoon level={level} />;
  }

  if (KNOWN_BONUS.has(slug)) {
    return (
      <ComingSoonGeneric
        title={slug === "skills" ? "Skills Tree" : "Contact"}
        subtitle="Bonus stage · coming soon"
        theme={slug === "skills" ? "#A855F7" : "#F59E0B"}
      />
    );
  }

  return <NotFound slug={slug} />;
}

function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {children}
      </main>
    </div>
  );
}

function ComingSoon({ level }: { level: Level }) {
  return (
    <PageShell>
      <div
        className="mb-8 h-32 w-full max-w-md rounded-lg border border-black/30"
        style={{ background: level.theme }}
        aria-hidden
      />
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.4em] text-zinc-500">
        Loading Level
      </p>
      <h1 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
        Level: {level.locationName}
      </h1>
      <p className="mb-10 font-mono text-sm text-zinc-400">coming soon</p>
      <Link
        href="/"
        className="rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-2 font-mono text-xs uppercase tracking-widest text-zinc-300 transition hover:border-zinc-500 hover:text-white"
      >
        ← Back to World Map
      </Link>
    </PageShell>
  );
}

function ComingSoonGeneric({
  title,
  subtitle,
  theme,
}: {
  title: string;
  subtitle: string;
  theme: string;
}) {
  return (
    <PageShell>
      <div
        className="mb-8 h-32 w-full max-w-md rounded-lg border border-black/30"
        style={{ background: theme }}
        aria-hidden
      />
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.4em] text-zinc-500">
        {subtitle}
      </p>
      <h1 className="mb-10 text-4xl font-black tracking-tight text-white sm:text-5xl">
        {title}
      </h1>
      <Link
        href="/"
        className="rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-2 font-mono text-xs uppercase tracking-widest text-zinc-300 transition hover:border-zinc-500 hover:text-white"
      >
        ← Back to World Map
      </Link>
    </PageShell>
  );
}

function NotFound({ slug }: { slug: string }) {
  return (
    <PageShell>
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.4em] text-red-400">
        404
      </p>
      <h1 className="mb-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
        Level not found
      </h1>
      <p className="mb-10 font-mono text-sm text-zinc-400">
        No level matches “{slug}”.
      </p>
      <Link
        href="/"
        className="rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-2 font-mono text-xs uppercase tracking-widest text-zinc-300 transition hover:border-zinc-500 hover:text-white"
      >
        ← Back to World Map
      </Link>
    </PageShell>
  );
}
