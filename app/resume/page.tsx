"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { CONTACT } from "@/lib/contact";

const PHONE_DISPLAY = "+91 91130 49917";
const PORTFOLIO_URL = "/";

type Role = {
  title: string;
  company: string;
  dates: string;
  subline?: string;
  bullets: string[];
};

const ROLES: Role[] = [
  {
    title: "AVP, Product",
    company: "Cars24 / CarInfo",
    dates: "Oct 2025 – Jun 2026",
    subline:
      "Reported to CEO • Hybrid IC + people manager • Owned U2L and DAU/MAU mandate across CarInfo, VehicleInfo, Cars24 (43M MAU combined) • Team: 4 PMs, 4 engineers, 1 data analyst",
    bullets: [
      "Launched Garage, a personalized vehicle-management surface inside CarInfo. Drove ~20K cars added in the first two months and ramped the feature to ~₹5 Cr/month gross sales run-rate, opening a new revenue line for the platform.",
      "Lifted Created-to-Pay funnel from 20% to 35% in one quarter through three coordinated bets: a dynamic, intent-aware bottom sheet; a personalization screen tied to vehicle and source signals; and a Lead Management module that sequences nudges by predicted purchase intent.",
      "Grew Service History gross sales by 25% and net profit by 20% in a single quarter (net sales steady at ~₹30 lakh/month) by re-pricing low-margin SKUs, tightening the booking funnel, and reducing vendor-side leakage.",
      "Replaced third-party CRM with an in-house, AI-built CRM. Scoped, prototyped, and shipped with a 2-person team in an internal AI hackathon. Serves the 10-person operations org, eliminating recurring license spend and unlocking custom workflows the vendor could not support.",
      "Built a behavioral Lead Scoring layer that buckets users by purchase-likelihood using install source, GA event patterns, in-app engagement, exit behavior, vehicle search intent, and demographics. Marketing targets high-quality buckets first, driving a 25% lift in User-to-Lead conversion.",
      "Built a user prediction layer forecasting next-action sequence, churn probability, and intent. Output powered Growth cohorts and lifecycle marketing, contributing to higher product adoption and a ~20% lift in average sessions per user.",
      "Migrated all consumer surfaces behind a BFF + CMS config layer. Non-engineers ship UI changes, collapsing time-to-experiment from weeks to hours.",
      "Shipped a Claude-based automated product-testing plugin (beta) that runs end-to-end regression on user-facing flows, reducing manual QA effort on every release.",
    ],
  },
  {
    title: "Assistant Vice President, Product & Technology",
    company: "Rozana.in",
    dates: "Jul 2024 – Sep 2025",
    subline: "P&L owner for rural commerce platform • 10+ PM org • ₹300 Cr+ portfolio",
    bullets: [
      "Owned a ₹300 Cr+ rural commerce P&L, set multi-year product vision, instituted OKRs across a 10+ PM org, and delivered 30% YoY growth on the portfolio.",
      "Rebuilt product discovery for low-literacy, low-bandwidth users using semantic search and a RAG retrieval layer tuned to Indian-language queries and local buying patterns, lifting CTR by 18%.",
      "Shipped a contextual recommendation engine (seasonality, region, connectivity-aware) that reduced catalog drop-offs in low-connectivity geographies and improved repeat engagement.",
      "Deployed an AI-driven helpdesk with semantic chunking and contextual retrieval. Resolved ~35% of queries instantly and cut average resolution time by 28%.",
      "Built hub-level demand forecasting that improved inventory accuracy by ~40% and held 95%+ fill rates in remote villages, directly de-risking the rural distribution model.",
    ],
  },
  {
    title: "Product Manager",
    company: "Jupiter Money",
    dates: "Jun 2022 – Jun 2024",
    subline:
      "Owned credit & payments stack covering onboarding, card issuance, authorization, settlements, and fraud",
    bullets: [
      "Rebuilt onboarding from a 25-minute, 5%-converting funnel into a sub-10-minute flow converting at 9% by re-sequencing steps and integrating PAN, Aadhaar, and bureau APIs to remove manual entry. Nearly doubled top-of-funnel conversion and contributed to 3x active users YoY.",
      "Defined requirements for a high-reliability payments stack with NPCI, Visa, and Mastercard, including ISO 8583 dual and single-message flows with intelligent routing. Lifted authorization success rates by ~8% with zero regulatory escalations across the period.",
      "Embedded RBI KYC/AML rules, velocity checks, and dispute workflows into the live transaction path. Kept the stack compliant through multiple audit cycles while scaling volume.",
      "Launched a multi-benefit credit card. Designed the rewards architecture and spend-analytics surface that drove 3x YoY growth in active card usage.",
      "Killed a near-shipped feature 48 hours before launch after surfacing an RBI-guideline conflict missed earlier in scoping. Painful, but the right call, and now a checklist item in every fintech feature I scope.",
    ],
  },
  {
    title: "Product Consultant",
    company: "Urbanic",
    dates: "Jan 2022 – Jun 2022",
    bullets: [
      "Advised on consumer app redesign for the India launch. Research across India and Europe fed a redesigned catalog and checkout experience; partnered with engineering on AWS-hosted APIs. Contributed to a ~30% lift in app installs over the launch period.",
      "Benchmarked quick-fashion competitors and helped scope new product lines that opened ~20% incremental sales in the India market entry.",
    ],
  },
  {
    title: "Associate Product Manager",
    company: "Flipkart",
    dates: "May 2019 – Jan 2022",
    subline:
      "Fraud & risk management • Protected millions of daily transactions on India's largest e-commerce platform",
    bullets: [
      "Owned the FRM product roadmap, combining rule engine, ML-based risk scoring, and third-party intelligence APIs to identify fraud patterns in transaction data. Materially reduced fraud incidents on the platform.",
      "Built scalable seller verification and risk-scoring workflows that improved authenticity detection by ~15% and supported regulatory compliance.",
      "Worked directly on data-driven pattern discovery, translating analyst findings into shippable rules and feature requests for the ML team.",
    ],
  },
  {
    title: "Product Consultant",
    company: "Myntra",
    dates: "Dec 2018 – May 2019",
    bullets: [
      "Audited AI-generated customer-support transcripts at 90%+ accuracy, feeding labeled data back into model training. Contributed front-end fixes and usability analysis on the consumer app.",
    ],
  },
];

const SKILLS: { label: string; body: string }[] = [
  {
    label: "Product Leadership",
    body: "Vision & strategy, OKR design, PM hiring & mentoring, executive stakeholder management, P&L ownership",
  },
  {
    label: "Domains",
    body: "Consumer fintech (cards, credit, payments), marketplaces, growth, rural commerce, AI/ML platforms",
  },
  {
    label: "AI & Data",
    body: "Building with LLMs (RAG, semantic search, agentic workflows), behavioral scoring, predictive cohorting, A/B experimentation, SQL, Python (analysis)",
  },
  {
    label: "Payments & Compliance",
    body: "NPCI / Visa / Mastercard integrations, ISO 8583 flows, RBI KYC / AML, dispute workflows",
  },
  {
    label: "Tools",
    body: "Mixpanel, Amplitude, GA4, Figma, Jira, Linear, Claude (build + automate), Notion, SQL",
  },
];

const CERTIFICATIONS = [
  "Six Sigma Black Belt (Regression & Forecasting)",
  "Time Series Analysis with Python",
  "Google Advanced Analytics",
  "Data Science Projects in Python",
  "RPA Fundamentals",
  "Google Digital Marketing",
];

export default function ResumePage() {
  // Make device-back land on /#chapters even when /resume was a deep link.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cameFromInternalChapters = false;
    try {
      if (document.referrer) {
        const u = new URL(document.referrer);
        cameFromInternalChapters =
          u.origin === window.location.origin &&
          (u.hash === "#chapters" || u.pathname === "/");
      }
    } catch {
      // bad URL — treat as deep link
    }
    if (cameFromInternalChapters) return;
    try {
      window.history.replaceState(null, "", "/#chapters");
      window.history.pushState(null, "", "/resume");
    } catch {
      // history API unavailable
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-[720px] px-6 py-12 sm:py-16">
        {/* Top row: back link + download CTA */}
        <div className="mb-8 flex flex-col-reverse items-stretch gap-3 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/#chapters"
            className="inline-flex items-center font-mono text-xs uppercase tracking-widest text-zinc-400 transition hover:text-white"
          >
            ← Choose a chapter
          </Link>
          <a
            href="/Agniv_Kashyap_Resume.pdf"
            download="Agniv_Kashyap_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 font-mono text-[13px] text-white transition hover:bg-white/[0.10] focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <DownloadIcon />
            <span>Download PDF</span>
          </a>
        </div>

        {/* HEADER */}
        <header className="mb-10 border-b border-zinc-800 pb-8">
          <h1 className="font-pixel text-[26px] leading-[1.2] text-white sm:text-[34px]">
            AGNIV KASHYAP
          </h1>
          <p className="mt-3 font-mono text-[13px] leading-relaxed text-zinc-300 sm:text-sm">
            Product Leader | AI-Driven Consumer Platforms | Fintech &amp; Marketplaces |
            0-to-1 and Scale
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-zinc-400">
            <span>Delhi, India</span>
            <Sep />
            <span>{PHONE_DISPLAY}</span>
            <Sep />
            <a
              href={`mailto:${CONTACT.channels.email}`}
              className="text-zinc-300 underline-offset-4 transition hover:text-white hover:underline"
            >
              {CONTACT.channels.email}
            </a>
            <Sep />
            <a
              href={CONTACT.channels.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 underline-offset-4 transition hover:text-white hover:underline"
            >
              LinkedIn
            </a>
            <Sep />
            <Link
              href={PORTFOLIO_URL}
              className="text-zinc-300 underline-offset-4 transition hover:text-white hover:underline"
            >
              Portfolio
            </Link>
          </p>
        </header>

        {/* SUMMARY */}
        <Section title="Summary">
          <p className="font-mono text-[13px] leading-[1.7] text-zinc-200 sm:text-sm">
            Product leader with 7+ years across consumer fintech, e-commerce, and
            AI-driven platforms. Most recently led product for Cars24 — a 43M-MAU
            platform spanning CarInfo, VehicleInfo, and Cars24 — reporting to the
            CEO. Ship 0-to-1 products under ambiguity, build and lead PM teams,
            and operate close to the metric: high-reliability payments and credit
            at Jupiter Money, ₹300 Cr+ rural commerce P&amp;L at Rozana,
            platform-led U2L and stickiness gains at Cars24. Comfortable building
            with AI directly: have replaced vendor tooling with in-house,
            AI-built systems and shipped behavioral lead-scoring and prediction
            layers used by Marketing and Growth. Open to Product Leadership roles
            across fintech, marketplaces, and AI-native consumer platforms.
          </p>
        </Section>

        {/* EXPERIENCE */}
        <Section title="Experience">
          <div className="space-y-10">
            {ROLES.map((role) => (
              <RoleBlock key={`${role.company}-${role.dates}`} role={role} />
            ))}
          </div>
        </Section>

        {/* SKILLS */}
        <Section title="Skills">
          <ul className="space-y-2.5">
            {SKILLS.map((s) => (
              <li
                key={s.label}
                className="font-mono text-[13px] leading-[1.6] sm:text-sm"
              >
                <span className="text-zinc-500">{s.label}:</span>{" "}
                <span className="text-zinc-100">{s.body}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* EDUCATION */}
        <Section title="Education">
          <ul className="space-y-2 font-mono text-[13px] leading-[1.6] text-zinc-200 sm:text-sm">
            <li>
              <span className="font-semibold text-white">
                BS, Data Science &amp; Applications
              </span>{" "}
              — Indian Institute of Technology, Madras (In Progress)
            </li>
            <li>
              <span className="font-semibold text-white">
                Higher Secondary (Class XII)
              </span>{" "}
              — AHSEC, Assam (2013)
            </li>
          </ul>
        </Section>

        {/* CERTIFICATIONS */}
        <Section title="Certifications">
          <p className="font-mono text-[13px] leading-[1.7] text-zinc-200 sm:text-sm">
            {CERTIFICATIONS.map((c, i) => (
              <span key={c}>
                {c}
                {i < CERTIFICATIONS.length - 1 && (
                  <span className="mx-2 text-zinc-600">·</span>
                )}
              </span>
            ))}
          </p>
        </Section>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 sm:mt-12">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
        {title}
      </h2>
      <div className="mt-2 mb-5 h-px w-full bg-zinc-800" />
      {children}
    </section>
  );
}

function RoleBlock({ role }: { role: Role }) {
  return (
    <article>
      <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3 className="text-[16px] font-bold text-white">{role.title}</h3>
          <p className="font-mono text-[13px] italic text-zinc-300">
            {role.company}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-zinc-500 sm:text-xs">
          {role.dates}
        </span>
      </header>

      {role.subline && (
        <p className="mt-2 font-mono text-[12px] leading-[1.6] text-zinc-400 sm:text-[13px]">
          {role.subline}
        </p>
      )}

      <ul className="mt-3 list-disc space-y-2 pl-5 font-mono text-[13px] leading-[1.6] text-zinc-200 sm:text-sm">
        {role.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </article>
  );
}

function Sep() {
  return (
    <span aria-hidden className="text-zinc-700">
      ·
    </span>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
