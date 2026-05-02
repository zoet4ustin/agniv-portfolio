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
const WORLD_W = 2400;
const GROUND_Y = 400;
const PLAYER_W = 32;
const PLAYER_H = 40;
const ENEMY_W = 28;
const ENEMY_H = 28;

const GRAVITY = 0.55;
const JUMP_V = -12;
const MOVE_SPEED = 3.5;
const FRICTION = 0.7;
const MAX_FALL = 14;

const FLAG_X = WORLD_W - 80;

const SPAWN = { x: 80, y: GROUND_Y - PLAYER_H };

const TICK_MS = 1000 / 60;

type Platform = { x: number; y: number; w: number; h: number };
type EnemyState = {
  id: string;
  label: string;
  solution: string;
  x: number;
  y: number;
  vx: number;
  minX: number;
  maxX: number;
  alive: boolean;
};

const PLATFORMS: Platform[] = [
  { x: 600, y: 300, w: 200, h: 16 },
  { x: 1200, y: 240, w: 200, h: 16 },
];

function buildEnemies(level: Level): EnemyState[] {
  const positions = [
    { x: 400, y: GROUND_Y - ENEMY_H, min: 400, max: 500 - ENEMY_W },
    { x: 620, y: 300 - ENEMY_H, min: 600, max: 800 - ENEMY_W },
    { x: 1500, y: GROUND_Y - ENEMY_H, min: 1500, max: 1700 - ENEMY_W },
  ];
  return level.enemies.slice(0, 3).map((e, i) => ({
    id: e.id,
    label: e.label,
    solution: e.solution,
    x: positions[i].x,
    y: positions[i].y,
    vx: 1,
    minX: positions[i].min,
    maxX: positions[i].max,
    alive: true,
  }));
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
    px: SPAWN.x,
    py: SPAWN.y,
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

  // Touch detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    setIsTouch(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Keyboard
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

  const respawn = useCallback(() => {
    const s = stateRef.current;
    s.px = SPAWN.x;
    s.py = SPAWN.y;
    s.vx = 0;
    s.vy = 0;
    s.cameraX = 0;
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

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
      if (s.px + PLAYER_W > WORLD_W) {
        s.px = WORLD_W - PLAYER_W;
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
      for (const p of PLATFORMS) {
        const overlapsX = s.px + PLAYER_W > p.x && s.px < p.x + p.w;
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
      const target = clamp(s.px - CANVAS_W / 2 + PLAYER_W / 2, 0, WORLD_W - CANVAS_W);
      s.cameraX += (target - s.cameraX) * 0.1;

      // Flag
      if (!s.completed && s.px >= FLAG_X) {
        s.completed = true;
        onCompleteRef.current();
      }
    };

    const render = () => {
      const s = stateRef.current;
      // Sky
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Distant clouds (simple decoration, parallax)
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 600 - s.cameraX * 0.3) % (WORLD_W + 400)) - 200;
        drawCloud(ctx, cx, 60 + (i % 2) * 28);
      }

      ctx.save();
      ctx.translate(-Math.round(s.cameraX), 0);

      // Ground
      ctx.fillStyle = "#5fb850";
      ctx.fillRect(0, GROUND_Y, WORLD_W, CANVAS_H - GROUND_Y);
      ctx.fillStyle = "#3d8c3a";
      ctx.fillRect(0, GROUND_Y, WORLD_W, 4);

      // Platforms
      for (const p of PLATFORMS) {
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = "#6e3710";
        ctx.fillRect(p.x, p.y, p.w, 3);
      }

      // Flag
      drawFlag(ctx, FLAG_X, GROUND_Y);

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
      acc += Math.min(elapsed, 100); // cap to avoid spiral of death
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
  }, [respawn, showToast]);

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
        {/* Theme top bar */}
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

        {/* Top-left HUD */}
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-1 sm:left-4 sm:top-4">
          <div className="rounded-md border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white shadow backdrop-blur sm:text-xs">
            {level.company}
          </div>
          <div className="rounded-md border border-white/15 bg-black/55 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white shadow backdrop-blur sm:text-[11px]">
            Solutions unlocked: {solutions} / {level.enemies.length}
          </div>
        </div>

        {/* Top-right link */}
        <Link
          href="/resume"
          className="absolute right-3 top-3 z-20 rounded-md border border-white/20 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white shadow backdrop-blur transition hover:bg-black/80 sm:right-4 sm:top-4 sm:text-xs"
        >
          Skip the game, see resume →
        </Link>

        {/* Toast */}
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
        {isTouch ? "Tap controls below · jump on enemies" : "Arrow keys / A·D to move · ↑ / W / Space to jump"}
      </p>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.arc(x + 18, y - 6, 18, 0, Math.PI * 2);
  ctx.arc(x + 36, y, 14, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlag(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  const poleH = 140;
  const top = groundY - poleH;
  // pole
  ctx.fillStyle = "#7a4a1a";
  ctx.fillRect(x, top, 6, poleH);
  // flag
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(x + 6, top + 6);
  ctx.lineTo(x + 6 + 38, top + 18);
  ctx.lineTo(x + 6, top + 30);
  ctx.closePath();
  ctx.fill();
  // base
  ctx.fillStyle = "#3d8c3a";
  ctx.fillRect(x - 6, groundY - 4, 18, 4);
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: EnemyState) {
  // Label
  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  const labelY = e.y - 12;
  const tw = ctx.measureText(e.label).width;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(e.x + ENEMY_W / 2 - tw / 2 - 5, labelY - 11, tw + 10, 16);
  ctx.fillStyle = "#fff";
  ctx.fillText(e.label, e.x + ENEMY_W / 2, labelY);
  ctx.textAlign = "start";

  // Body
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(e.x, e.y, ENEMY_W, ENEMY_H);
  ctx.fillStyle = "#a31818";
  ctx.fillRect(e.x, e.y + ENEMY_H - 4, ENEMY_W, 4);
  // Eyes
  ctx.fillStyle = "#fff";
  ctx.fillRect(e.x + 5, e.y + 7, 6, 7);
  ctx.fillRect(e.x + ENEMY_W - 11, e.y + 7, 6, 7);
  // Pupils — track movement direction
  const pupilOffset = e.vx > 0 ? 3 : e.vx < 0 ? 0 : 1;
  ctx.fillStyle = "#000";
  ctx.fillRect(e.x + 5 + pupilOffset, e.y + 9, 3, 3);
  ctx.fillRect(e.x + ENEMY_W - 11 + pupilOffset, e.y + 9, 3, 3);
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, vx: number) {
  // Body
  ctx.fillStyle = "#2563eb";
  ctx.fillRect(x, y + 10, PLAYER_W, PLAYER_H - 10);
  // Belt
  ctx.fillStyle = "#1d3f96";
  ctx.fillRect(x, y + 24, PLAYER_W, 3);
  // Head
  ctx.fillStyle = "#f3d9b1";
  ctx.fillRect(x + 4, y, PLAYER_W - 8, 14);
  // Eyes
  const facing = vx >= 0 ? 1 : -1;
  ctx.fillStyle = "#000";
  if (facing > 0) {
    ctx.fillRect(x + 18, y + 5, 3, 3);
    ctx.fillRect(x + 24, y + 5, 3, 3);
  } else {
    ctx.fillRect(x + 5, y + 5, 3, 3);
    ctx.fillRect(x + 11, y + 5, 3, 3);
  }
  // Cap
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(x + 2, y - 2, PLAYER_W - 4, 4);
  ctx.fillRect(x + (facing > 0 ? PLAYER_W - 10 : 2), y - 4, 8, 4);
}
