"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { CONTACT } from "@/lib/contact";
import { useMediaQuery } from "@/lib/useMediaQuery";

const EMAIL_SUBJECT = "Hello Agniv";
const GMAIL_COMPOSE = (() => {
  const subject = encodeURIComponent(EMAIL_SUBJECT);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    CONTACT.channels.email
  )}&su=${subject}`;
})();
const MAILTO = `mailto:${CONTACT.channels.email}?subject=${encodeURIComponent(
  EMAIL_SUBJECT
)}`;

type CardKey = "email" | "linkedin" | "github" | "instagram" | "phone";

export default function ContactExhibit() {
  const isTouch = useMediaQuery("(pointer: coarse)");
  const [confirmation, setConfirmation] = useState<{
    key: CardKey;
    message: string;
  } | null>(null);
  const confirmTimerRef = useRef<number | null>(null);

  const flash = useCallback((key: CardKey, message: string) => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    setConfirmation({ key, message });
    confirmTimerRef.current = window.setTimeout(() => {
      setConfirmation((c) => (c?.key === key ? null : c));
    }, 2000);
  }, []);

  const copy = useCallback(async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Email click — copy + open. On desktop opens Gmail compose in a new tab.
  // On mobile we let the underlying <a href="mailto:"> do its thing so iOS
  // Safari treats it as user-initiated.
  const onEmailClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isTouch) {
        e.preventDefault();
        window.open(GMAIL_COMPOSE, "_blank", "noopener,noreferrer");
      }
      await copy(CONTACT.channels.email);
      flash("email", "✓ Copied. Opening email...");
    },
    [isTouch, copy, flash]
  );

  const onPhoneClick = useCallback(async () => {
    const ok = await copy(CONTACT.channels.phone);
    flash("phone", ok ? "✓ Copied" : "Couldn't copy — please email or DM");
  }, [copy, flash]);

  // Twinkling background — same shape as the constellation page.
  const twinkles = useMemo(
    () =>
      Array.from({ length: 80 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 4,
        size: 1 + Math.random() * 2,
      })),
    []
  );

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-x-hidden text-zinc-100"
      style={{
        background:
          "radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a14 60%, #050508 100%)",
      }}
    >
      {/* Twinkling background — fixed so it stays put as content scrolls. */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {twinkles.map((t, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: t.size,
              height: t.size,
              opacity: 0.18,
              animation: `constellationTwinkle ${t.duration}s ease-in-out ${t.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Sticky back-to-map */}
      <Link
        href="/#chapters"
        className="fixed left-4 top-4 z-30 rounded-md border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-200 backdrop-blur transition hover:bg-black/80 sm:left-6 sm:top-6"
      >
        ← Back to map
      </Link>

      <main className="relative z-10 mx-auto w-full max-w-[720px] px-6 pb-20 pt-24 sm:pt-28">
        {/* HERO */}
        <header className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-500 sm:text-xs">
            Get In Touch
          </p>
          <h1 className="mt-5 font-pixel text-[28px] leading-[1.2] text-white sm:text-[36px]">
            {CONTACT.name}
          </h1>
          <p className="mt-3 font-mono text-[15px] text-zinc-300 opacity-90 sm:text-base">
            {CONTACT.role} · {CONTACT.currentCompany}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-zinc-400">
            <PinIcon />
            {CONTACT.location}
          </span>
        </header>

        {/* PITCH BLOCK */}
        <section className="mx-auto mt-14 max-w-[540px] px-6 text-center sm:mt-16">
          <p className="font-mono leading-[1.7] text-zinc-200 text-[15px] sm:text-[17px]">
            {CONTACT.pitchLine}
          </p>
        </section>

        {/* CHANNEL CARDS */}
        <section className="mt-20 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Email — anchor so iOS Safari accepts mailto */}
          <ChannelCard
            as="a"
            href={MAILTO}
            onClick={onEmailClick}
            icon={<EmailIcon />}
            label="Email"
            sub="connect.agnivkashyap@gmail.com"
            confirmation={
              confirmation?.key === "email" ? confirmation.message : null
            }
          />

          <ChannelCard
            as="a"
            href={CONTACT.channels.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            icon={<LinkedInIcon />}
            label="LinkedIn"
            sub="linkedin.com/in/connectagniv"
          />

          <ChannelCard
            as="a"
            href={CONTACT.channels.github}
            target="_blank"
            rel="noopener noreferrer"
            icon={<GitHubIcon />}
            label="GitHub"
            sub="@zoet4ustin"
          />

          <ChannelCard
            as="a"
            href={CONTACT.channels.instagram}
            target="_blank"
            rel="noopener noreferrer"
            icon={<InstagramIcon />}
            label="Instagram"
            sub="@agnivkashyap"
            secondary="where the travel + photography lives"
          />

          {/* Phone — copy only, no tel: dialer. Digits never appear in
              the rendered HTML; they only travel from CONTACT.channels.phone
              into the clipboard inside onPhoneClick. */}
          <ChannelCard
            as="button"
            onClick={onPhoneClick}
            icon={<PhoneIcon />}
            label="Phone"
            sub="Tap to copy phone number"
            confirmation={
              confirmation?.key === "phone" ? confirmation.message : null
            }
          />
        </section>

        {/* RESUME CTA — visually distinct from the channel cards */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/resume"
            className="group flex w-full items-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-6 py-4 text-left transition hover:bg-white/[0.10] focus:outline-none focus:ring-2 focus:ring-white/20 sm:w-[320px]"
          >
            <span className="shrink-0 text-white/80 transition group-hover:text-white">
              <ResumeIcon />
            </span>
            <span className="flex-1 font-mono text-[14px] text-white">
              Read my resume
            </span>
            <span className="font-mono text-white/60 transition group-hover:text-white">
              →
            </span>
          </Link>
        </div>

        {/* SIGN-OFF — Reid Hoffman quote */}
        <footer className="mx-auto mt-8 max-w-[480px] text-center">
          <p
            className="font-mono italic leading-[1.6] text-zinc-200"
            style={{ fontSize: 13, opacity: 0.65 }}
          >
            “If you are not embarrassed by the first version of your product,
            you&apos;ve launched too late.”
          </p>
          <p
            className="mt-2 font-mono text-zinc-300"
            style={{ fontSize: 12, opacity: 0.45 }}
          >
            — Reid Hoffman
          </p>
        </footer>
      </main>
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────

type CommonCardProps = {
  icon: ReactNode;
  label: string;
  sub: string;
  secondary?: string;
  confirmation?: string | null;
};

type CardAsAnchor = CommonCardProps & {
  as: "a";
  href: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

type CardAsButton = CommonCardProps & {
  as: "button";
  onClick: () => void;
};

function ChannelCard(props: CardAsAnchor | CardAsButton) {
  const { icon, label, sub, secondary, confirmation } = props;
  const baseClass =
    "group relative flex min-h-[64px] items-start gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-5 text-left transition hover:scale-[1.02] hover:border-white/15 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/20 game-no-select";

  const inner = (
    <>
      <div className="mt-0.5 shrink-0 text-white/70 transition group-hover:text-white">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-pixel text-[13px] leading-tight text-white">
          {label}
        </div>
        <div
          className={`mt-1 truncate font-mono text-[13px] transition ${
            confirmation ? "text-emerald-300" : "text-zinc-300"
          }`}
        >
          {confirmation ?? sub}
        </div>
        {secondary && !confirmation && (
          <div className="mt-1 font-mono text-[11px] text-zinc-500">
            {secondary}
          </div>
        )}
      </div>
    </>
  );

  if (props.as === "a") {
    return (
      <a
        href={props.href}
        target={props.target}
        rel={props.rel}
        onClick={props.onClick}
        className={baseClass}
      >
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={props.onClick} className={baseClass}>
      {inner}
    </button>
  );
}

// ─── Icons (24x24, currentColor) ───────────────────────────────────────

function EmailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 9.5h-3v9h3v-9zM7 5.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5zM18.5 18.5v-5c0-2.485-2.015-4.5-4.5-4.5a3.5 3.5 0 0 0-2.5 1.05V9.5h-3v9h3v-4.5a2 2 0 0 1 4 0v4.5h3z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.6 3 8.5 7.2 9.9.5.1.7-.2.7-.5v-1.7c-2.9.6-3.6-1.4-3.6-1.4-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.6 1.1 1.6 1.1 1 1.6 2.5 1.2 3.1.9.1-.7.4-1.2.7-1.5-2.3-.3-4.7-1.2-4.7-5.1 0-1.1.4-2 1.1-2.7-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1.8-.2 1.7-.3 2.6-.3.9 0 1.8.1 2.6.3 2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.5.1 2.8.7.7 1.1 1.6 1.1 2.7 0 3.9-2.4 4.7-4.7 5 .4.3.7.9.7 1.9V21.4c0 .3.2.6.7.5 4.2-1.4 7.2-5.3 7.2-9.9 0-5.8-4.7-10.5-10.5-10.5z"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}
