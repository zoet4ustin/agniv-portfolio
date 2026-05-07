"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CLUSTERS, SKILLS, type Cluster, type Skill } from "@/lib/skills";
import { useMediaQuery } from "@/lib/useMediaQuery";

// ─── Layouts ───────────────────────────────────────────────────────────
// Hand-positioned constellations. Two variants so portrait phones get a
// vertical stack rather than a wide-and-short squish.

type Pos = { x: number; y: number };
type Layout = {
  width: number;
  height: number;
  positions: Record<string, Pos>;
  clusterLabels: Record<Cluster, Pos>;
};

const HORIZONTAL: Layout = {
  width: 1400,
  height: 760,
  positions: {
    "product-strategy": { x: 160, y: 320 },
    "funnel-conversion": { x: 320, y: 200 },
    "zero-to-one": { x: 420, y: 460 },
    "discovery-insight": { x: 200, y: 560 },
    "ai-ml-product": { x: 660, y: 220 },
    "consumer-fintech": { x: 600, y: 480 },
    "platform-thinking": { x: 820, y: 320 },
    "data-driven": { x: 760, y: 560 },
    "pm-hiring-mentoring": { x: 1080, y: 220 },
    "cross-functional": { x: 1200, y: 360 },
    "executive-stakeholder": { x: 1300, y: 220 },
    "crisis-decisions": { x: 1140, y: 560 },
  },
  clusterLabels: {
    craft: { x: 270, y: 110 },
    depth: { x: 730, y: 110 },
    leadership: { x: 1190, y: 110 },
  },
};

const VERTICAL: Layout = {
  width: 700,
  height: 1500,
  positions: {
    "product-strategy": { x: 200, y: 200 },
    "funnel-conversion": { x: 460, y: 130 },
    "zero-to-one": { x: 520, y: 380 },
    "discovery-insight": { x: 240, y: 460 },
    "ai-ml-product": { x: 200, y: 700 },
    "consumer-fintech": { x: 460, y: 880 },
    "platform-thinking": { x: 520, y: 750 },
    "data-driven": { x: 280, y: 940 },
    "pm-hiring-mentoring": { x: 200, y: 1180 },
    "cross-functional": { x: 460, y: 1320 },
    "executive-stakeholder": { x: 520, y: 1180 },
    "crisis-decisions": { x: 280, y: 1430 },
  },
  clusterLabels: {
    craft: { x: 350, y: 70 },
    depth: { x: 350, y: 600 },
    leadership: { x: 350, y: 1080 },
  },
};

const CONSTELLATION_LINES: [string, string][] = [
  ["product-strategy", "funnel-conversion"],
  ["funnel-conversion", "zero-to-one"],
  ["zero-to-one", "discovery-insight"],
  ["discovery-insight", "product-strategy"],
  ["ai-ml-product", "consumer-fintech"],
  ["ai-ml-product", "platform-thinking"],
  ["platform-thinking", "data-driven"],
  ["consumer-fintech", "data-driven"],
  ["pm-hiring-mentoring", "cross-functional"],
  ["cross-functional", "executive-stakeholder"],
  ["executive-stakeholder", "crisis-decisions"],
  ["pm-hiring-mentoring", "crisis-decisions"],
];

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.5;
const DEFAULT_ZOOM = 1;
const DEFAULT_PAN = { x: 0, y: 0 };
const FRAME_PADDING = 56; // breathing room around the auto-fit constellation
const PAN_OVERSCROLL = 0.2; // how much past the edge users can drag (% of viewport)
const SKILL_TARGET_ATTR = "data-skill-target";

// ─── Component ─────────────────────────────────────────────────────────

export default function SkillsConstellation() {
  const router = useRouter();
  const isPortraitMobile = useMediaQuery(
    "(max-width: 720px) and (orientation: portrait)"
  );
  const layout = isPortraitMobile ? VERTICAL : HORIZONTAL;

  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [fitScale, setFitScale] = useState(1);
  const [pan, setPan] = useState(DEFAULT_PAN);
  const [isDragging, setIsDragging] = useState(false);
  const [openSkill, setOpenSkill] = useState<Skill | null>(null);
  const [inspected, setInspected] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [allInspectedFlash, setAllInspectedFlash] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPan: { x: number; y: number };
  } | null>(null);

  // Refs mirror state so pointer/wheel handlers (attached once) can read
  // current values without re-attaching on every state change.
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const fitScaleRef = useRef(fitScale);
  const layoutRef = useRef(layout);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);
  useEffect(() => {
    fitScaleRef.current = fitScale;
  }, [fitScale]);
  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  const skillById = useMemo(() => {
    const m = new Map<string, Skill>();
    for (const s of SKILLS) m.set(s.id, s);
    return m;
  }, []);

  // Auto-fit the constellation to viewport. zoom=1 ("100%") corresponds to
  // this fit scale, so 60%/250% read as you'd expect from any zoom UI.
  useEffect(() => {
    const compute = () => {
      if (typeof window === "undefined") return 1;
      const availW = window.innerWidth - FRAME_PADDING * 2;
      const availH = window.innerHeight - FRAME_PADDING * 2 - 120; // top + bottom bars
      return Math.min(availW / layout.width, availH / layout.height, 1);
    };
    setFitScale(compute());
    const onResize = () => setFitScale(compute());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [layout]);

  const inspectStar = useCallback(
    (skillId: string) => {
      const s = skillById.get(skillId);
      if (!s) return;
      setOpenSkill(s);
      setInspected((prev) => {
        if (prev.has(skillId)) return prev;
        const next = new Set(prev);
        next.add(skillId);
        if (next.size === SKILLS.length) {
          setAllInspectedFlash(true);
          window.setTimeout(() => setAllInspectedFlash(false), 5000);
        }
        return next;
      });
    },
    [skillById]
  );
  const closeSkill = useCallback(() => setOpenSkill(null), []);

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + 0.2) * 100) / 100)),
    []
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - 0.2) * 100) / 100)),
    []
  );
  const zoomReset = useCallback(() => {
    setZoom(DEFAULT_ZOOM);
    setPan(DEFAULT_PAN);
  }, []);

  // Soft pan boundaries — limit so at least the center of the constellation
  // stays near the viewport. Reads scale via refs so drag-time updates use
  // the latest zoom/fit values.
  const computePanBounds = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return { xMax: 0, yMax: 0 };
    const rect = frame.getBoundingClientRect();
    const scale = fitScaleRef.current * zoomRef.current;
    const dispW = layoutRef.current.width * scale;
    const dispH = layoutRef.current.height * scale;
    const xMax = Math.max(0, (dispW - rect.width) / 2) + rect.width * PAN_OVERSCROLL;
    const yMax = Math.max(0, (dispH - rect.height) / 2) + rect.height * PAN_OVERSCROLL;
    return { xMax, yMax };
  }, []);

  const clampPan = useCallback(
    (p: { x: number; y: number }) => {
      const { xMax, yMax } = computePanBounds();
      return { x: clamp(p.x, -xMax, xMax), y: clamp(p.y, -yMax, yMax) };
    },
    [computePanBounds]
  );

  // Whenever the display scale changes, re-clamp the existing pan so we
  // don't get stuck outside the new bounds (e.g., zoom out → bounds shrink).
  useEffect(() => {
    setPan((p) => clampPan(p));
  }, [zoom, fitScale, layout, clampPan]);

  // Mouse drag → pan. Listeners on the frame for mousedown, on window for
  // move/up so the drag survives leaving the element.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as Element | null;
      if (target?.closest?.(`[${SKILL_TARGET_ATTR}]`)) return;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPan: { ...panRef.current },
      };
      setIsDragging(true);
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPan(
        clampPan({
          x: dragRef.current.startPan.x + dx,
          y: dragRef.current.startPan.y + dy,
        })
      );
    };

    const onMouseUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setIsDragging(false);
    };

    frame.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      frame.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [clampPan]);

  // Touch — single-finger pan, two-finger pinch zoom. Both share dragRef
  // and pinchRef so they don't fight each other.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const dist = (a: Touch, b: Touch) =>
      Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        const target = t.target as Element | null;
        if (target?.closest?.(`[${SKILL_TARGET_ATTR}]`)) return;
        dragRef.current = {
          startX: t.clientX,
          startY: t.clientY,
          startPan: { ...panRef.current },
        };
        setIsDragging(true);
        e.preventDefault();
      } else if (e.touches.length === 2) {
        pinchRef.current = {
          dist: dist(e.touches[0], e.touches[1]),
          zoom: zoomRef.current,
        };
        // Cancel any in-flight pan so it doesn't fight the pinch.
        dragRef.current = null;
        setIsDragging(false);
        e.preventDefault();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (dragRef.current && e.touches.length === 1) {
        const t = e.touches[0];
        const dx = t.clientX - dragRef.current.startX;
        const dy = t.clientY - dragRef.current.startY;
        setPan(
          clampPan({
            x: dragRef.current.startPan.x + dx,
            y: dragRef.current.startPan.y + dy,
          })
        );
        e.preventDefault();
      } else if (pinchRef.current && e.touches.length === 2) {
        const d = dist(e.touches[0], e.touches[1]);
        const factor = d / pinchRef.current.dist;
        setZoom(clamp(pinchRef.current.zoom * factor, MIN_ZOOM, MAX_ZOOM));
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        dragRef.current = null;
        setIsDragging(false);
      }
      if (e.touches.length < 2) pinchRef.current = null;
    };

    frame.addEventListener("touchstart", onTouchStart, { passive: false });
    frame.addEventListener("touchmove", onTouchMove, { passive: false });
    frame.addEventListener("touchend", onTouchEnd);
    frame.addEventListener("touchcancel", onTouchEnd);
    return () => {
      frame.removeEventListener("touchstart", onTouchStart);
      frame.removeEventListener("touchmove", onTouchMove);
      frame.removeEventListener("touchend", onTouchEnd);
      frame.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [clampPan]);

  // Wheel — Ctrl/Cmd zooms; otherwise pan by deltaX/deltaY (trackpad
  // two-finger swipe, plain wheel scroll).
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.0015;
        setZoom((z) => clamp(z + delta, MIN_ZOOM, MAX_ZOOM));
      } else {
        e.preventDefault();
        setPan((p) =>
          clampPan({ x: p.x - e.deltaX, y: p.y - e.deltaY })
        );
      }
    };
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
  }, [clampPan]);

  // Keyboard navigation: arrow keys move focus to the nearest star in
  // that direction; Enter opens the popup.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (openSkill) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Enter" && focusedId) {
        e.preventDefault();
        inspectStar(focusedId);
        return;
      }
      if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        e.preventDefault();
        const current = focusedId
          ? layout.positions[focusedId]
          : { x: layout.width / 2, y: layout.height / 2 };
        let bestId: string | null = null;
        let bestScore = Infinity;
        for (const skill of SKILLS) {
          if (skill.id === focusedId) continue;
          const pos = layout.positions[skill.id];
          const dx = pos.x - current.x;
          const dy = pos.y - current.y;
          if (e.key === "ArrowRight" && dx <= 0) continue;
          if (e.key === "ArrowLeft" && dx >= 0) continue;
          if (e.key === "ArrowDown" && dy <= 0) continue;
          if (e.key === "ArrowUp" && dy >= 0) continue;
          const d = Math.hypot(dx, dy);
          if (d < bestScore) {
            bestScore = d;
            bestId = skill.id;
          }
        }
        if (bestId) setFocusedId(bestId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusedId, openSkill, inspectStar, layout]);

  // Background twinkles — stable across re-renders.
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

  const allInspected = inspected.size === SKILLS.length;
  const displayScale = fitScale * zoom;
  // Disable transitions during any active interaction so the constellation
  // tracks the cursor/finger 1:1; keep them on for button-driven changes.
  const interacting = isDragging || pinchRef.current !== null;
  const transitionStyle = interacting
    ? "none"
    : "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)";

  return (
    <div
      className="relative w-full overflow-hidden game-no-select"
      style={{
        height: "100dvh",
        background:
          "radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a14 60%, #050508 100%)",
      }}
    >
      {/* Twinkling background dots */}
      <div className="pointer-events-none absolute inset-0">
        {twinkles.map((t, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: t.size,
              height: t.size,
              opacity: 0.2,
              animation: `constellationTwinkle ${t.duration}s ease-in-out ${t.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="rounded-md border border-white/15 bg-black/55 px-3 py-1.5 font-pixel text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur sm:text-[11px]">
            Skill Constellation
          </span>
          <span className="rounded-md border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-300 backdrop-blur">
            Inspected: {inspected.size} / {SKILLS.length}
          </span>
        </div>
        <Link
          href="/#chapters"
          className="pointer-events-auto rounded-md border border-white/20 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur transition hover:bg-black/80"
        >
          ← Back to map
        </Link>
      </div>

      {/* Constellation frame */}
      <div
        ref={frameRef}
        className={`absolute inset-0 flex items-center justify-center ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ touchAction: "none" }}
      >
        <div
          className="relative"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${displayScale})`,
            transformOrigin: "center center",
            transition: transitionStyle,
          }}
        >
          <svg
            width={layout.width}
            height={layout.height}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            className="absolute inset-0"
            aria-label="Skill constellation"
          >
            <defs>
              <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
              </filter>
            </defs>

            {/* Lines */}
            {CONSTELLATION_LINES.map(([a, b], i) => {
              const pa = layout.positions[a];
              const pb = layout.positions[b];
              const sk = skillById.get(a);
              const color = CLUSTERS[sk?.cluster ?? "craft"].color;
              return (
                <line
                  key={`line-${i}`}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke={color}
                  strokeOpacity={0.16}
                  strokeWidth={1}
                />
              );
            })}

            {/* Glow halos */}
            {SKILLS.map((skill) => {
              const pos = layout.positions[skill.id];
              const color = CLUSTERS[skill.cluster].color;
              const isHot = hoveredId === skill.id || focusedId === skill.id;
              return (
                <circle
                  key={`glow-${skill.id}`}
                  cx={pos.x}
                  cy={pos.y}
                  r={isHot ? 26 : 18}
                  fill={color}
                  opacity={isHot ? 0.55 : 0.25}
                  filter="url(#starGlow)"
                  style={{ transition: "all 250ms ease-out" }}
                />
              );
            })}

            {/* Star cores (interactive) */}
            {SKILLS.map((skill) => {
              const pos = layout.positions[skill.id];
              const color = CLUSTERS[skill.cluster].color;
              const isHot = hoveredId === skill.id || focusedId === skill.id;
              const isInspected = inspected.has(skill.id);
              return (
                <g
                  key={`star-${skill.id}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect ${skill.name}`}
                  data-skill-target="true"
                  className="cursor-pointer outline-none"
                  style={{
                    animation: isHot
                      ? "starBounce 700ms ease-in-out infinite"
                      : "none",
                  }}
                  onMouseEnter={() => setHoveredId(skill.id)}
                  onMouseLeave={() =>
                    setHoveredId((id) => (id === skill.id ? null : id))
                  }
                  onFocus={() => setFocusedId(skill.id)}
                  onBlur={() =>
                    setFocusedId((id) => (id === skill.id ? null : id))
                  }
                  onClick={() => inspectStar(skill.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      inspectStar(skill.id);
                    }
                  }}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isHot ? 12 : 8}
                    fill={color}
                    stroke={isInspected ? "#ffffff" : "transparent"}
                    strokeWidth={isInspected ? 1.5 : 0}
                    strokeOpacity={isInspected ? 0.5 : 0}
                    style={{ transition: "all 250ms ease-out" }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Cluster labels (HTML so they don't fight SVG text rendering) */}
          {(Object.keys(layout.clusterLabels) as Cluster[]).map((c) => {
            const pos = layout.clusterLabels[c];
            const cluster = CLUSTERS[c];
            return (
              <div
                key={c}
                className="pointer-events-none absolute font-pixel text-[12px] uppercase tracking-[0.32em] sm:text-[14px]"
                style={{
                  left: pos.x,
                  top: pos.y,
                  color: cluster.color,
                  opacity: 0.65,
                  transform: "translate(-50%, -50%)",
                  textShadow: `0 0 14px ${cluster.color}99`,
                  whiteSpace: "nowrap",
                }}
              >
                {cluster.label}
              </div>
            );
          })}

          {/* Skill name labels under each star */}
          {SKILLS.map((skill) => {
            const pos = layout.positions[skill.id];
            const isHot = hoveredId === skill.id || focusedId === skill.id;
            const isInspected = inspected.has(skill.id);
            return (
              <button
                key={`label-${skill.id}`}
                type="button"
                onClick={() => inspectStar(skill.id)}
                onMouseEnter={() => setHoveredId(skill.id)}
                onMouseLeave={() =>
                  setHoveredId((id) => (id === skill.id ? null : id))
                }
                data-skill-target="true"
                className="absolute font-mono leading-tight text-center cursor-pointer outline-none whitespace-nowrap game-no-select"
                style={{
                  left: pos.x,
                  top: pos.y + 18,
                  transform: "translateX(-50%)",
                  fontSize: isHot ? 12 : 9,
                  opacity: isHot ? 1 : 0.7,
                  color: isHot ? CLUSTERS[skill.cluster].color : "white",
                  textShadow: isHot ? `0 0 8px ${CLUSTERS[skill.cluster].color}` : "none",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  transition: "all 250ms ease-out",
                }}
              >
                {skill.name}
                {isInspected && !isHot && (
                  <span
                    className="ml-1"
                    style={{ color: CLUSTERS[skill.cluster].color }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
        <span
          className="font-mono text-[11px] text-white"
          style={{ opacity: 0.55 }}
        >
          Hover or tap a star to learn more
        </span>
        <div className="pointer-events-auto flex items-center gap-1">
          <ZoomBtn label="−" aria="Zoom out" onClick={zoomOut} disabled={zoom <= MIN_ZOOM + 1e-3} />
          <button
            type="button"
            onClick={zoomReset}
            aria-label="Reset zoom"
            className="grid h-8 min-w-[3.25rem] place-items-center rounded-md border border-white/15 bg-black/55 px-2 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur transition hover:bg-black/80"
          >
            {Math.round(zoom * 100)}%
          </button>
          <ZoomBtn label="+" aria="Zoom in" onClick={zoomIn} disabled={zoom >= MAX_ZOOM - 1e-3} />
        </div>
      </div>

      {/* All inspected celebration */}
      {allInspected && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 z-30 flex justify-center">
          <Link
            href="/#chapters"
            className="pointer-events-auto rounded-md border border-amber-300/60 bg-amber-300/10 px-5 py-2 font-pixel text-[10px] uppercase tracking-[0.2em] text-amber-200 backdrop-blur transition hover:bg-amber-300/20"
            style={{
              animation: allInspectedFlash ? "fadeUp 0.5s ease-out both" : undefined,
            }}
          >
            ✓ All inspected. Back to map →
          </Link>
        </div>
      )}
      {allInspectedFlash && <Confetti />}

      {/* Skill detail popup */}
      {openSkill && (
        <SkillPopup
          skill={openSkill}
          onClose={closeSkill}
          onCompanyClick={(slug) => {
            setOpenSkill(null);
            router.push(`/play/${slug}`);
          }}
        />
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────

function ZoomBtn({
  label,
  aria,
  onClick,
  disabled,
}: {
  label: ReactNode;
  aria: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      disabled={disabled}
      className="grid h-8 w-8 place-items-center rounded-md border border-white/15 bg-black/55 font-mono text-base text-white backdrop-blur transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black/55"
    >
      {label}
    </button>
  );
}

function SkillPopup({
  skill,
  onClose,
  onCompanyClick,
}: {
  skill: Skill;
  onClose: () => void;
  onCompanyClick: (slug: Skill["proofPoints"][number]["companySlug"]) => void;
}) {
  const cluster = CLUSTERS[skill.cluster];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 game-no-select"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] overflow-y-auto p-6 shadow-2xl sm:p-7"
        style={{
          background: "#13131e",
          border: `1px solid ${cluster.color}`,
          borderRadius: 16,
          maxHeight: "calc(100dvh - 32px)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-md text-base text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          ×
        </button>

        <p
          className="font-mono text-[11px] uppercase tracking-[0.3em]"
          style={{ color: cluster.color }}
        >
          Cluster · {cluster.label}
        </p>
        <h2
          id="skill-popup-title"
          className="mt-2 font-pixel text-base leading-[1.4] text-white sm:text-lg"
        >
          {skill.name}
        </h2>
        <p
          className="mt-3 font-mono leading-[1.6] text-zinc-200"
          style={{ fontSize: 13, opacity: 0.9 }}
        >
          {skill.blurb}
        </p>

        <div
          className="my-5 h-px"
          style={{ background: cluster.color, opacity: 0.3 }}
        />

        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          Proof Points
        </h3>
        <ul className="space-y-3">
          {skill.proofPoints.map((p, i) => (
            <li key={i} className="font-mono">
              <p className="text-[12px] leading-snug text-zinc-100">
                • {p.description}
              </p>
              <p
                className="mt-1 pl-3 text-[12px] leading-snug"
                style={{ color: cluster.color }}
              >
                → {p.outcome}
              </p>
              <PlayedAtPill
                slug={p.companySlug}
                onClick={() => onCompanyClick(p.companySlug)}
                color={cluster.color}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PlayedAtPill({
  slug,
  onClick,
  color,
}: {
  slug: string;
  onClick: () => void;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="mt-1.5 ml-3 inline-flex items-center gap-1 rounded-full border bg-white/5 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-zinc-300 transition"
      style={{
        borderColor: hovered ? color : "rgba(255,255,255,0.2)",
        color: hovered ? "#fff" : "rgb(212,212,216)",
        background: hovered ? `${color}22` : "rgba(255,255,255,0.05)",
      }}
    >
      {hovered ? "see this level →" : `played at: ${slug} →`}
    </button>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, () => ({
        x: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.2,
        rotate: Math.random() * 360,
        color: [
          CLUSTERS.craft.color,
          CLUSTERS.depth.color,
          CLUSTERS.leadership.color,
          "#fbbf24",
        ][Math.floor(Math.random() * 4)],
        w: 5 + Math.random() * 4,
        h: 9 + Math.random() * 6,
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: "-12%",
            width: p.w,
            height: p.h,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
