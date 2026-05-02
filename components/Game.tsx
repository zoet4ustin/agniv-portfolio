"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Level } from "@/lib/levels";
import { ASSETS } from "@/lib/assets";
import { AnimatedSprite, StaticImage } from "@/lib/sprite";
import MobileControls, { type MobileKey } from "./MobileControls";

type Props = {
  level: Level;
  onLevelComplete: () => void;
};

const CANVAS_W = 960;
const CANVAS_H = 480;
const GROUND_Y = 400;
const TILE = 16;
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
const TOAST_MS = 4000;

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

type ToastPayload = { problem: string; solution: string };

function buildEnemies(level: Level): EnemyState[] {
  return level.enemyPlacements.map((p) => {
    const e = level.enemies.find((en) => en.id === p.enemyId);
    if (!e) {
      throw new Error(
        `Enemy "${p.enemyId}" not found in level "${level.slug}"`
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

type PlayerAnim = "idle" | "run" | "jump" | "fall";

export default function Game({ level, onLevelComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [solutions, setSolutions] = useState(0);
  const [toast, setToast] = useState<ToastPayload | null>(null);
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
  const facingRef = useRef<1 | -1>(1);
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

  const showToast = useCallback((payload: ToastPayload) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (toastHideTimerRef.current) {
      clearTimeout(toastHideTimerRef.current);
      toastHideTimerRef.current = null;
    }
    setToast(payload);
    setToastShown(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setToastShown(true));
    });
    toastTimerRef.current = window.setTimeout(() => {
      setToastShown(false);
      toastHideTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, 320);
    }, TOAST_MS);
  }, []);

  // Game loop — re-runs when level changes (Game is also keyed on slug in PlayClient)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sprites — load once per mount.
    const sprites: Record<PlayerAnim, AnimatedSprite> = {
      idle: new AnimatedSprite(ASSETS.player.idle),
      run: new AnimatedSprite(ASSETS.player.run),
      jump: new AnimatedSprite(ASSETS.player.jump),
      fall: new AnimatedSprite(ASSETS.player.fall),
    };
    const terrainAtlas = new StaticImage(ASSETS.terrain.src);
    const flagSprite = new StaticImage(ASSETS.flag.idle);

    const platforms = level.platforms;
    const worldWidth = level.worldWidth;
    const flagX = level.flagPosition.x;
    const flagY = level.flagPosition.y;
    const sky = level.skyColor;
    const ground = level.groundColor;
    const groundDark = darken(ground, 0.25);

    // Pre-compute ground tile layout (col grid).
    const groundCols = Math.ceil(worldWidth / TILE);
    const groundRows = Math.ceil((CANVAS_H - GROUND_Y) / TILE);

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

      if (k.left && !k.right) s.vx = -MOVE_SPEED;
      else if (k.right && !k.left) s.vx = MOVE_SPEED;
      else s.vx *= FRICTION;
      if (Math.abs(s.vx) < 0.05) s.vx = 0;

      if (s.vx > 0.1) facingRef.current = 1;
      else if (s.vx < -0.1) facingRef.current = -1;

      if (k.jumpQueued && s.onGround) {
        s.vy = JUMP_V;
        s.onGround = false;
      }
      k.jumpQueued = false;

      s.vy += GRAVITY;
      if (s.vy > MAX_FALL) s.vy = MAX_FALL;

      s.px += s.vx;
      if (s.px < 0) {
        s.px = 0;
        s.vx = 0;
      }
      if (s.px + PLAYER_W > worldWidth) {
        s.px = worldWidth - PLAYER_W;
        s.vx = 0;
      }

      const prevBottom = s.py + PLAYER_H - s.vy;
      s.py += s.vy;

      s.onGround = false;
      if (s.py + PLAYER_H >= GROUND_Y) {
        s.py = GROUND_Y - PLAYER_H;
        s.vy = 0;
        s.onGround = true;
      }

      for (const p of platforms) {
        const overlapsX = s.px + PLAYER_W > p.x && s.px < p.x + p.width;
        const enteringTop = prevBottom <= p.y && s.py + PLAYER_H >= p.y;
        if (overlapsX && enteringTop && s.vy >= 0) {
          s.py = p.y - PLAYER_H;
          s.vy = 0;
          s.onGround = true;
        }
      }

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
          showToast({ problem: e.label, solution: e.solution });
        } else {
          respawn();
          break;
        }
      }

      const target = clamp(
        s.px - CANVAS_W / 2 + PLAYER_W / 2,
        0,
        Math.max(0, worldWidth - CANVAS_W)
      );
      s.cameraX += (target - s.cameraX) * 0.1;

      if (!s.completed && s.px >= flagX) {
        s.completed = true;
        onCompleteRef.current();
      }
    };

    const pickAnim = (s: State): PlayerAnim => {
      if (!s.onGround) return s.vy < 0 ? "jump" : "fall";
      return Math.abs(s.vx) > 0.5 ? "run" : "idle";
    };

    const render = (frameDeltaMs: number) => {
      const s = stateRef.current;
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Parallax wisp clouds.
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 5; i++) {
        const cx =
          (((i * 600 - s.cameraX * 0.3) % (worldWidth + 400)) +
            (worldWidth + 400)) %
            (worldWidth + 400) -
          200;
        drawCloud(ctx, cx, 60 + (i % 2) * 28);
      }

      ctx.save();
      ctx.translate(-Math.round(s.cameraX), 0);

      // Ground — tile if atlas loaded, else fill rect (so the level still
      // renders before the texture finishes loading).
      const atlasImg = terrainAtlas.image;
      if (atlasImg) {
        const gt = ASSETS.terrain.tiles.grassTop;
        const df = ASSETS.terrain.tiles.dirtFill;
        const camTileMin = Math.floor(s.cameraX / TILE) - 1;
        const camTileMax = Math.ceil((s.cameraX + CANVAS_W) / TILE) + 1;
        const lo = Math.max(0, camTileMin);
        const hi = Math.min(groundCols, camTileMax);
        for (let col = lo; col < hi; col++) {
          const x = col * TILE;
          ctx.drawImage(atlasImg, gt.x, gt.y, TILE, TILE, x, GROUND_Y, TILE, TILE);
          for (let row = 1; row < groundRows; row++) {
            ctx.drawImage(
              atlasImg,
              df.x,
              df.y,
              TILE,
              TILE,
              x,
              GROUND_Y + row * TILE,
              TILE,
              TILE
            );
          }
        }
      } else {
        ctx.fillStyle = ground;
        ctx.fillRect(0, GROUND_Y, worldWidth, CANVAS_H - GROUND_Y);
        ctx.fillStyle = groundDark;
        ctx.fillRect(0, GROUND_Y, worldWidth, 4);
      }

      // Platforms — tile if atlas loaded, else solid block.
      for (const p of platforms) {
        if (atlasImg) {
          const pt = ASSETS.terrain.tiles.platform;
          const cols = Math.max(1, Math.round(p.width / TILE));
          for (let i = 0; i < cols; i++) {
            ctx.drawImage(
              atlasImg,
              pt.x,
              pt.y,
              TILE,
              TILE,
              p.x + i * TILE,
              p.y,
              TILE,
              TILE
            );
          }
        } else {
          ctx.fillStyle = "#8B4513";
          ctx.fillRect(p.x, p.y, p.width, PLATFORM_H);
          ctx.fillStyle = "#6e3710";
          ctx.fillRect(p.x, p.y, p.width, 3);
        }
      }

      // Flag — End (Idle) sprite if loaded, else stylized fallback.
      const flagImg = flagSprite.image;
      if (flagImg) {
        const fSize = ASSETS.flag.size;
        ctx.drawImage(flagImg, flagX - fSize / 2, flagY - fSize, fSize, fSize);
      } else {
        drawFlagFallback(ctx, flagX, flagY, level.theme);
      }

      // Enemies — pixel-styled rectangles. (Pack ships no enemy spritesheets;
      // see lib/assets.ts and the README note.)
      for (const e of s.enemies) {
        if (!e.alive) continue;
        drawEnemy(ctx, e);
      }

      // Player — animated sprite. Update + draw the active anim.
      const anim = pickAnim(s);
      sprites[anim].update(frameDeltaMs);
      const flipped = facingRef.current < 0;
      // Sprite is 32x32; align bottom with hitbox bottom (py + PLAYER_H).
      const drewSprite = sprites[anim].draw(
        ctx,
        Math.round(s.px),
        Math.round(s.py + PLAYER_H - 32),
        flipped
      );
      if (!drewSprite) {
        // Sprite not loaded yet — hitbox-shaped placeholder so the player
        // is still visible during the first few frames.
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(s.px, s.py, PLAYER_W, PLAYER_H);
      }

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
      render(elapsed);
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
          className="block h-auto w-full max-w-[100vw] outline-none [image-rendering:pixelated]"
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
            aria-live="polite"
            className="pointer-events-none absolute left-1/2 top-10 z-30 w-[min(360px,90%)] sm:top-12"
            style={{
              animation: toastShown
                ? "lootDropIn 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards"
                : "lootDropOut 0.3s ease-in forwards",
            }}
          >
            <div
              className="rounded-md border-2 bg-zinc-950/95 px-4 py-3 shadow-2xl backdrop-blur"
              style={{ borderColor: "#f5c518" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-amber-400" aria-hidden>
                  ★
                </span>
                <span
                  className="font-pixel text-[10px] uppercase tracking-[0.2em] text-amber-300"
                >
                  Solution Unlocked
                </span>
              </div>
              <div className="space-y-1 font-mono text-[11px] leading-snug text-zinc-200 sm:text-xs">
                <p>
                  <span className="text-zinc-500">Problem:</span> {toast.problem}
                </p>
                <p>
                  <span className="text-zinc-500">Solution:</span>{" "}
                  {toast.solution}
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="rounded-sm border border-amber-400/60 bg-amber-400/15 px-2 py-0.5 font-pixel text-[9px] uppercase tracking-widest text-amber-200">
                  +1 Solution
                </span>
              </div>
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

function drawFlagFallback(
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
