"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Level } from "@/lib/levels";
import MobileControls, { type MobileKey } from "./MobileControls";

type Props = {
  level: Level;
  onLevelComplete: () => void;
};

const CANVAS_W = 960;
const CANVAS_H = 480;
const GROUND_Y = 400;
const PLATFORM_H = 16;
const PLAYER_W = 32;
const PLAYER_H = 40;
const ENEMY_W = 28;
const ENEMY_H = 28;

const GRAVITY = 0.55;
const JUMP_V = -12;
const MOVE_SPEED = 3.5;
const FRICTION = 0.7;
const MAX_FALL = 14;

const TICK_MS = 1000 / 60;

type EnemyState = {
  id: string;
  label: string;
  solution: string;
  isCurrentBattle: boolean;
  x: number;
  y: number;
  vx: number;
  minX: number;
  maxX: number;
  alive: boolean;
};

function buildEnemies(level: Level): EnemyState[] {
  return level.enemyPlacements.map((p) => {
    const e = level.enemies.find((en) => en.id === p.enemyId);
    if (!e) {
      throw new Error(
        `Enemy "${p.enemyId}" referenced in placements not found in level "${level.slug}"`
      );
    }
    return {
      id: e.id,
      label: e.label,
      solution: e.solution,
      isCurrentBattle: e.isCurrentBattle ?? false,
      x: p.x,
      y: p.y,
      vx: 1,
      minX: p.patrolMin,
      maxX: p.patrolMax,
      alive: true,
    };
  });
}

type Keys = {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpQueued: boolean;
};

type State = {
  px: number;
  py: number;
  vx: number;
  vy: number;
  onGround: boolean;
  cameraX: number;
  enemies: EnemyState[];
  completed: boolean;
};

export default function Game({ level, onLevelComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [solutions, setSolutions] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [toastShown, setToastShown] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const keysRef = useRef<Keys>({
    left: false,
    right: false,
    jump: false,
    jumpQueued: false,
  });
  const stateRef = useRef<State>({
    px: level.playerStart.x,
    py: level.playerStart.y,
    vx: 0,
    vy: 0,
    onGround: true,
    cameraX: 0,
    enemies: buildEnemies(level),
    completed: false,
  });
  const toastTimerRef = useRef<number | null>(null);
  const toastHideTimerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onLevelComplete);

  useEffect(() => {
    onCompleteRef.current = onLevelComplete;
  }, [onLevelComplete]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    setIsTouch(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const isJumpKey = (k: string) =>
      k === "ArrowUp" || k === "w" || k === "W" || k === " " || k === "Spacebar";
    const isLeft = (k: string) => k === "ArrowLeft" || k === "a" || k === "A";
    const isRight = (k: string) => k === "ArrowRight" || k === "d" || k === "D";

    const onDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (isLeft(e.key)) {
        keysRef.current.left = true;
        e.preventDefault();
      } else if (isRight(e.key)) {
        keysRef.current.right = true;
        e.preventDefault();
      } else if (isJumpKey(e.key)) {
        if (!keysRef.current.jump) keysRef.current.jumpQueued = true;
        keysRef.current.jump = true;
        e.preventDefault();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (isLeft(e.key)) keysRef.current.left = false;
      else if (isRight(e.key)) keysRef.current.right = false;
      else if (isJumpKey(e.key)) keysRef.current.jump = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const showToast = useCallback((text: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (toastHideTimerRef.current) {
      clearTimeout(toastHideTimerRef.current);
      toastHideTimerRef.current = null;
    }
    setToast(text);
    setToastShown(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setToastShown(true));
    });
    toastTimerRef.current = window.setTimeout(() => {
      setToastShown(false);
      toastHideTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, 320);
    }, 3000);
  }, []);

  // Game loop — re-runs when level changes (Game is also keyed on slug in PlayClient)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const platforms = level.platforms;
    const worldWidth = level.worldWidth;
    const flagX = level.flagPosition.x;
    const flagY = level.flagPosition.y;
    const sky = level.skyColor;
    const ground = level.groundColor;
    const groundDark = darken(ground, 0.25);

    const respawn = () => {
      const s = stateRef.current;
      s.px = level.playerStart.x;
      s.py = level.playerStart.y;
      s.vx = 0;
      s.vy = 0;
      s.cameraX = 0;
    };

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const physicsStep = () => {
      const s = stateRef.current;
      const k = keysRef.current;
      if (s.completed) return;

      // Horizontal input
      if (k.left && !k.right) s.vx = -MOVE_SPEED;
      else if (k.right && !k.left) s.vx = MOVE_SPEED;
      else s.vx *= FRICTION;
      if (Math.abs(s.vx) < 0.05) s.vx = 0;

      // Jump
      if (k.jumpQueued && s.onGround) {
        s.vy = JUMP_V;
        s.onGround = false;
      }
      k.jumpQueued = false;

      // Gravity
      s.vy += GRAVITY;
      if (s.vy > MAX_FALL) s.vy = MAX_FALL;

      // Horizontal move + bounds
      s.px += s.vx;
      if (s.px < 0) {
        s.px = 0;
        s.vx = 0;
      }
      if (s.px + PLAYER_W > worldWidth) {
        s.px = worldWidth - PLAYER_W;
        s.vx = 0;
      }

      // Vertical move
      const prevBottom = s.py + PLAYER_H - s.vy;
      s.py += s.vy;

      // Ground collision
      s.onGround = false;
      if (s.py + PLAYER_H >= GROUND_Y) {
        s.py = GROUND_Y - PLAYER_H;
        s.vy = 0;
        s.onGround = true;
      }

      // Platform collisions (top-only)
      for (const p of platforms) {
        const overlapsX = s.px + PLAYER_W > p.x && s.px < p.x + p.width;
        const enteringTop = prevBottom <= p.y && s.py + PLAYER_H >= p.y;
        if (overlapsX && enteringTop && s.vy >= 0) {
          s.py = p.y - PLAYER_H;
          s.vy = 0;
          s.onGround = true;
        }
      }

      // Enemies
      for (const e of s.enemies) {
        if (!e.alive) continue;
        e.x += e.vx;
        if (e.x < e.minX) {
          e.x = e.minX;
          e.vx = Math.abs(e.vx);
        }
        if (e.x > e.maxX) {
          e.x = e.maxX;
          e.vx = -Math.abs(e.vx);
        }

        // The ongoing battle is pass-through: never kills the player, never
        // dies. Player can run/jump straight through it.
        if (e.isCurrentBattle) continue;

        const overlap =
          s.px + PLAYER_W > e.x &&
          s.px < e.x + ENEMY_W &&
          s.py + PLAYER_H > e.y &&
          s.py < e.y + ENEMY_H;
        if (!overlap) continue;

        const playerBottom = s.py + PLAYER_H;
        if (s.vy > 0 && playerBottom - e.y < 18) {
          e.alive = false;
          s.vy = JUMP_V * 0.6;
          setSolutions((c) => c + 1);
          showToast(e.solution);
        } else {
          respawn();
          break;
        }
      }

      // Camera lerp toward player center
      const target = clamp(
        s.px - CANVAS_W / 2 + PLAYER_W / 2,
        0,
        Math.max(0, worldWidth - CANVAS_W)
      );
      s.cameraX += (target - s.cameraX) * 0.1;

      // Flag
      if (!s.completed && s.px >= flagX) {
        s.completed = true;
        onCompleteRef.current();
      }
    };

    const render = () => {
      const s = stateRef.current;

      // Sky
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Wispy parallax clouds — slight transparency reads against any sky
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 5; i++) {
        const cx =
          ((i * 600 - s.cameraX * 0.3) % (worldWidth + 400) +
            (worldWidth + 400)) %
            (worldWidth + 400) -
          200;
        drawCloud(ctx, cx, 60 + (i % 2) * 28);
      }

      ctx.save();
      ctx.translate(-Math.round(s.cameraX), 0);

      // Ground
      ctx.fillStyle = ground;
      ctx.fillRect(0, GROUND_Y, worldWidth, CANVAS_H - GROUND_Y);
      ctx.fillStyle = groundDark;
      ctx.fillRect(0, GROUND_Y, worldWidth, 4);

      // Platforms
      for (const p of platforms) {
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(p.x, p.y, p.width, PLATFORM_H);
        ctx.fillStyle = "#6e3710";
        ctx.fillRect(p.x, p.y, p.width, 3);
      }

      // Flag
      drawFlag(ctx, flagX, flagY, level.theme);

      // Enemies
      for (const e of s.enemies) {
        if (!e.alive) continue;
        drawEnemy(ctx, e);
      }

      // Player
      drawPlayer(ctx, s.px, s.py, s.vx);

      ctx.restore();
    };

    const loop = (now: number) => {
      const elapsed = now - last;
      last = now;
      acc += Math.min(elapsed, 100);
      while (acc >= TICK_MS) {
        physicsStep();
        acc -= TICK_MS;
      }
      render();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (toastHideTimerRef.current) clearTimeout(toastHideTimerRef.current);
    };
  }, [level, showToast]);

  const handleMobilePress = useCallback((key: MobileKey, down: boolean) => {
    if (key === "left") keysRef.current.left = down;
    else if (key === "right") keysRef.current.right = down;
    else if (key === "jump") {
      if (down && !keysRef.current.jump) keysRef.current.jumpQueued = true;
      keysRef.current.jump = down;
    }
  }, []);

  return (
    <div className="relative w-full bg-zinc-950 px-2 pb-6 pt-3 text-zinc-100 sm:px-4">
      <div
        className="relative mx-auto w-full max-w-[960px] overflow-hidden rounded-md border border-zinc-800 shadow-xl"
        style={{ aspectRatio: "2 / 1" }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1.5"
          style={{ background: level.theme }}
          aria-hidden
        />

        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          tabIndex={0}
          onClick={(e) => e.currentTarget.focus()}
          className="block h-auto w-full max-w-[100vw] outline-none"
          style={{ aspectRatio: "2 / 1", touchAction: "none" }}
          aria-label={`${level.locationName} game canvas`}
        />

        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-1 sm:left-4 sm:top-4">
          <div className="rounded-md border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white shadow backdrop-blur sm:text-xs">
            {level.company}
          </div>
          <div className="rounded-md border border-white/15 bg-black/55 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white shadow backdrop-blur sm:text-[11px]">
            Solutions unlocked: {solutions} / {level.enemies.length}
          </div>
        </div>

        <Link
          href="/resume"
          className="absolute right-3 top-3 z-20 rounded-md border border-white/20 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white shadow backdrop-blur transition hover:bg-black/80 sm:right-4 sm:top-4 sm:text-xs"
        >
          Skip the game, see resume →
        </Link>

        {toast && (
          <div
            role="status"
            className="pointer-events-none absolute left-1/2 top-12 z-20 max-w-[85%] transition-all duration-300 ease-out sm:top-14"
            style={{
              transform: `translateX(-50%) translateY(${toastShown ? "0" : "-2.5rem"})`,
              opacity: toastShown ? 1 : 0,
            }}
          >
            <div className="rounded-md border border-emerald-400/50 bg-emerald-500/15 px-4 py-2 text-center text-xs font-medium text-emerald-100 shadow-lg backdrop-blur sm:text-sm">
              <span className="mr-1 font-bold text-emerald-300">✓</span>
              {toast}
            </div>
          </div>
        )}

        {isTouch && <MobileControls onPress={handleMobilePress} />}
      </div>

      <p className="mx-auto mt-3 max-w-[960px] text-center font-mono text-[10px] uppercase tracking-widest text-zinc-500 sm:text-xs">
        {isTouch
          ? "Tap controls below · jump on enemies"
          : "Arrow keys / A·D to move · ↑ / W / Space to jump"}
      </p>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function darken(hex: string, factor: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const v = parseInt(m[1], 16);
  const r = (v >> 16) & 0xff;
  const g = (v >> 8) & 0xff;
  const b = v & 0xff;
  const adj = (c: number) => Math.max(0, Math.round(c * (1 - factor)));
  const out = (adj(r) << 16) | (adj(g) << 8) | adj(b);
  return `#${out.toString(16).padStart(6, "0")}`;
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.arc(x + 18, y - 6, 18, 0, Math.PI * 2);
  ctx.arc(x + 36, y, 14, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlag(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  flagColor: string
) {
  const poleH = 140;
  const top = groundY - poleH;
  ctx.fillStyle = "#7a4a1a";
  ctx.fillRect(x, top, 6, poleH);
  ctx.fillStyle = flagColor;
  ctx.beginPath();
  ctx.moveTo(x + 6, top + 6);
  ctx.lineTo(x + 6 + 38, top + 18);
  ctx.lineTo(x + 6, top + 30);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3d8c3a";
  ctx.fillRect(x - 6, groundY - 4, 18, 4);
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: EnemyState) {
  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  const labelY = e.y - 12;
  const tw = ctx.measureText(e.label).width;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(e.x + ENEMY_W / 2 - tw / 2 - 5, labelY - 11, tw + 10, 16);
  ctx.fillStyle = "#fff";
  ctx.fillText(e.label, e.x + ENEMY_W / 2, labelY);
  ctx.textAlign = "start";

  ctx.fillStyle = "#dc2626";
  ctx.fillRect(e.x, e.y, ENEMY_W, ENEMY_H);
  ctx.fillStyle = "#a31818";
  ctx.fillRect(e.x, e.y + ENEMY_H - 4, ENEMY_W, 4);
  ctx.fillStyle = "#fff";
  ctx.fillRect(e.x + 5, e.y + 7, 6, 7);
  ctx.fillRect(e.x + ENEMY_W - 11, e.y + 7, 6, 7);
  const pupilOffset = e.vx > 0 ? 3 : e.vx < 0 ? 0 : 1;
  ctx.fillStyle = "#000";
  ctx.fillRect(e.x + 5 + pupilOffset, e.y + 9, 3, 3);
  ctx.fillRect(e.x + ENEMY_W - 11 + pupilOffset, e.y + 9, 3, 3);
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  vx: number
) {
  ctx.fillStyle = "#2563eb";
  ctx.fillRect(x, y + 10, PLAYER_W, PLAYER_H - 10);
  ctx.fillStyle = "#1d3f96";
  ctx.fillRect(x, y + 24, PLAYER_W, 3);
  ctx.fillStyle = "#f3d9b1";
  ctx.fillRect(x + 4, y, PLAYER_W - 8, 14);
  const facing = vx >= 0 ? 1 : -1;
  ctx.fillStyle = "#000";
  if (facing > 0) {
    ctx.fillRect(x + 18, y + 5, 3, 3);
    ctx.fillRect(x + 24, y + 5, 3, 3);
  } else {
    ctx.fillRect(x + 5, y + 5, 3, 3);
    ctx.fillRect(x + 11, y + 5, 3, 3);
  }
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(x + 2, y - 2, PLAYER_W - 4, 4);
  ctx.fillRect(x + (facing > 0 ? PLAYER_W - 10 : 2), y - 4, 8, 4);
}

