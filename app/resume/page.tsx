import Link from "next/link";
import { contact } from "@/lib/contact";

export default function ResumePage() {
  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="mb-10 inline-block font-mono text-xs uppercase tracking-widest text-zinc-400 transition hover:text-white"
        >
          ← Back to game
        </Link>

        <header className="mb-10 border-b border-zinc-800 pb-6">
          <h1 className="text-4xl font-black tracking-tight text-white">
            Agniv Kashyap
          </h1>
          <p className="mt-2 text-zinc-400">
            Product Leader · Consumer Fintech, E-commerce, AI Platforms
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-400">
            <a href={`mailto:${contact.email}`} className="hover:text-white">
              {contact.email}
            </a>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              LinkedIn
            </a>
            <span>{contact.phone}</span>
            <span>{contact.location}</span>
          </div>
        </header>

        <section className="mb-10">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            Summary
          </h2>
          <p className="text-base leading-relaxed text-zinc-300">
            Product leader with 7+ years across consumer fintech, e-commerce, and
            AI-driven platforms, most recently leading product for Cars24
            (43M-MAU platform spanning CarInfo, VehicleInfo, Cars24). Ships
            0-to-1 products under ambiguity, builds and leads PM teams, and
            operates close to the metric: high-reliability payments and credit
            at Jupiter, ₹300 Cr+ rural commerce P&amp;L at Rozana, and
            platform-led U2L and stickiness gains at Cars24.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            Experience
          </h2>

          <div className="mb-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-lg font-bold text-white">
                AVP, Product — Cars24 / CarInfo
              </h3>
              <span className="font-mono text-xs text-zinc-500">
                Oct 2025 – Present
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Reporting to CEO. Owns U2L and DAU/MAU mandate across 43M MAU.
              Team: 4 PMs, 4 engineers, 1 data analyst.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-zinc-300">
              <li>Launched Garage to ~₹5 Cr/month gross sales run-rate in 2 months</li>
              <li>Lifted Created-to-Pay funnel from 20% to 35% in one quarter</li>
              <li>Grew Service History gross sales 25%, net profit 20% in a quarter</li>
              <li>Replaced third-party CRM with in-house AI-built CRM in a 2-person hackathon</li>
              <li>Built behavioral Lead Scoring layer; +25% User-to-Lead conversion</li>
              <li>Built user prediction layer; ~20% lift in average sessions per user</li>
              <li>Migrated all consumer surfaces behind a BFF + CMS config layer</li>
            </ul>
          </div>

          <div className="mb-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-lg font-bold text-white">
                AVP, Product &amp; Technology — Rozana.in
              </h3>
              <span className="font-mono text-xs text-zinc-500">
                Jul 2024 – Sep 2025
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              P&amp;L owner for rural commerce. 10+ PM org. ₹300 Cr+ portfolio.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-zinc-300">
              <li>Owned ₹300 Cr+ P&amp;L; 30% YoY growth</li>
              <li>Semantic search + RAG; CTR +18%</li>
              <li>AI helpdesk: 35% queries auto-resolved; -28% resolution time</li>
              <li>Demand forecasting: inventory accuracy +40%; 95%+ fill rates</li>
            </ul>
          </div>

          <div className="mb-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-lg font-bold text-white">
                Product Manager — Jupiter Money
              </h3>
              <span className="font-mono text-xs text-zinc-500">
                Jun 2022 – Jun 2024
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Owned credit &amp; payments stack.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-zinc-300">
              <li>Onboarding 25 min to &lt;10 min; 5% to 9% conversion; 3x active users YoY</li>
              <li>NPCI/Visa/Mastercard payments stack; +8% auth success</li>
              <li>Embedded RBI KYC/AML across transaction path; 0 escalations</li>
              <li>Launched multi-benefit credit card; 3x YoY active card usage</li>
            </ul>
          </div>

          <div className="mb-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-lg font-bold text-white">
                Product Manager — Urbanic
              </h3>
              <span className="font-mono text-xs text-zinc-500">
                Jan 2022 – Jun 2022
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-300">
              Redesigned consumer app; +30% installs.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-lg font-bold text-white">
                Associate Product Manager — Flipkart
              </h3>
              <span className="font-mono text-xs text-zinc-500">
                May 2019 – Jan 2022
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Fraud &amp; risk management on India&apos;s largest e-commerce platform.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-zinc-300">
              <li>Rule engine + ML risk scoring + third-party intelligence</li>
              <li>Materially reduced fraud incidents</li>
              <li>+15% seller authenticity detection</li>
            </ul>
          </div>

          <div className="mb-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-lg font-bold text-white">
                Product Analyst (Intern) — Myntra
              </h3>
              <span className="font-mono text-xs text-zinc-500">
                Dec 2018 – May 2019
              </span>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            Education
          </h2>
          <ul className="space-y-1.5 text-sm text-zinc-300">
            <li>
              <span className="font-semibold text-white">
                BS, Data Science &amp; Applications
              </span>{" "}
              — IIT Madras (In Progress)
            </li>
            <li>
              <span className="font-semibold text-white">Higher Secondary</span>{" "}
              — AHSEC, Assam (2013)
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
