"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Level } from "@/lib/levels";
import { levels as ALL_LEVELS } from "@/lib/levels";
import { ASSETS, type EnemySpriteKey } from "@/lib/assets";
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
const TOAST_MS = 2000;
const TOAST_REEXPAND_MS = 3000;
const TOAST_OUT_MS = 400; // matches lootCollapseToChip duration
const INVINCIBLE_MS = 1500;
const TUTORIAL_RANGE = 200;
const TUTORIAL_DURATION_MS = 5000;
const INTRO_AUTO_DISMISS_MS = 4000;
const MOBILE_VERTICAL_SHIFT = 40; // shift world up on mobile so action sits above touch buttons

// One-time UX is persisted in localStorage so it survives tab close.
const TUTORIAL_LS_KEY = "agniv_tutorial_jump_seen";
const BOSS_TOAST_LS_KEY = "agniv_boss_toast_seen";
const introLsKey = (slug: string) => `agniv_intro_seen_${slug}`;

const HIRING_EMAIL = "connect.agnivkashyap@gmail.com";
const HIRING_SUBJECT = "Hiring conversation";
const HIRING_BODY =
  "Hi Agniv,\n\nI played your portfolio and want to talk about a role.\n\n";
const HIRING_LINKEDIN = "https://www.linkedin.com/in/connectagniv/";

const HIRING_MAILTO = (() => {
  const subject = encodeURIComponent(HIRING_SUBJECT);
  const body = encodeURIComponent(HIRING_BODY);
  return `mailto:${HIRING_EMAIL}?subject=${subject}&body=${body}`;
})();

const HIRING_GMAIL_COMPOSE = (() => {
  const subject = encodeURIComponent(HIRING_SUBJECT);
  const body = encodeURIComponent(HIRING_BODY);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    HIRING_EMAIL
  )}&su=${subject}&body=${body}`;
})();

type EnemyState = {
  id: string;
  label: string;
  solution: string;
  isCurrentBattle: boolean;
  spriteKey: EnemySpriteKey;
  spriteSize: number;
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
      spriteKey: e.spriteKey,
      spriteSize: e.spriteSize ?? 32,
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
  invincibleMs: number;
};

type PlayerAnim = "idle" | "run" | "jump" | "fall";

type TutorialState = {
  enemyId: string | null;
  shownAt: number;
  dismissed: boolean;
};


export default function Game({ level, onLevelComplete }: Props) {
  const [solutions, setSolutions] = useState(0);
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const [toastShown, setToastShown] = useState(false);
  const [latestSolution, setLatestSolution] = useState<ToastPayload | null>(null);
  const [chipKey, setChipKey] = useState(0);
  const [levelCompleted, setLevelCompleted] = useState(false);
  // "Copied!" feedback for the boss toast's contact menu.
  const [emailCopied, setEmailCopied] = useState(false);
  const emailCopiedTimerRef = useRef<number | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  // Banner is per-mount: navigating away and back re-shows it.
  const [bannerDismissed, setBannerDismissed] = useState(false);
  // Intro card — shown once per level per session.
  const [showIntro, setShowIntro] = useState(false);
  // Boss "still fighting" toast — only on Cars24, only the first stomp.
  const [bossToast, setBossToast] = useState(false);
  const [bossToastShown, setBossToastShown] = useState(false);
  // Canvas is referenced via state + callback ref so the game loop's
  // useEffect re-runs (and re-attaches its rAF + 2d context) whenever the
  // canvas DOM node changes — e.g. when the layout flips between portrait
  // and landscape branches and React remounts the element.
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const canvasRefCallback = useCallback((node: HTMLCanvasElement | null) => {
    setCanvasEl(node);
  }, []);

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
    invincibleMs: 0,
  });
  const facingRef = useRef<1 | -1>(1);
  const isTouchRef = useRef(false);
  const isPortraitRef = useRef(false);
  // Whether physics + input are paused (intro card up).
  const pausedRef = useRef(false);
  // Tracks whether the boss toast has fired in this session — survives
  // bouncing repeatedly off the boss without re-firing.
  const bossToastSessionRef = useRef(false);
  const bossToastTimerRef = useRef<number | null>(null);
  const bossToastHideTimerRef = useRef<number | null>(null);
  const tutorialRef = useRef<TutorialState>({
    enemyId: null,
    shownAt: 0,
    dismissed: true,
  });
  const toastTimerRef = useRef<number | null>(null);
  const toastHideTimerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onLevelComplete);

  useEffect(() => {
    onCompleteRef.current = onLevelComplete;
  }, [onLevelComplete]);

  // Tutorial hint is level-agnostic and persisted in localStorage so it
  // never re-appears once seen, even after closing the tab.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = window.localStorage.getItem(TUTORIAL_LS_KEY) === "true";
    } catch {
      // ignore
    }
    tutorialRef.current = { enemyId: null, shownAt: 0, dismissed: seen };
  }, [level.slug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)");
    const portrait = window.matchMedia("(orientation: portrait)");
    const sync = () => {
      setIsTouch(coarse.matches);
      isTouchRef.current = coarse.matches;
      setIsPortrait(portrait.matches);
      isPortraitRef.current = portrait.matches;
    };
    sync();
    coarse.addEventListener("change", sync);
    portrait.addEventListener("change", sync);
    return () => {
      coarse.removeEventListener("change", sync);
      portrait.removeEventListener("change", sync);
    };
  }, []);

  // Portrait banner: per-mount only — no persistence. Navigating away and
  // back re-mounts the component and the banner reappears.
  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
  }, []);

  // Intro card — once per level, ever (localStorage). Pauses physics + input
  // while visible. Flag is set the moment the card is shown, so navigating
  // away mid-display still counts as "seen".
  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = window.localStorage.getItem(introLsKey(level.slug)) === "true";
    } catch {
      // ignore
    }
    if (!seen) {
      setShowIntro(true);
      try {
        window.localStorage.setItem(introLsKey(level.slug), "true");
      } catch {
        // ignore
      }
    } else {
      setShowIntro(false);
    }
  }, [level.slug]);

  const dismissIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  // Auto-dismiss the intro card.
  useEffect(() => {
    if (!showIntro) return;
    const t = window.setTimeout(dismissIntro, INTRO_AUTO_DISMISS_MS);
    return () => window.clearTimeout(t);
  }, [showIntro, dismissIntro]);

  // Enter / Space dismiss the intro card.
  useEffect(() => {
    if (!showIntro) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        dismissIntro();
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [showIntro, dismissIntro]);

  // Sync the paused ref (game loop reads this each tick).
  useEffect(() => {
    pausedRef.current = showIntro;
  }, [showIntro]);

  // Boss toast — persistent localStorage flag, checked once per mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      bossToastSessionRef.current =
        window.localStorage.getItem(BOSS_TOAST_LS_KEY) === "true";
    } catch {
      bossToastSessionRef.current = false;
    }
  }, []);

  // Boss toast stays open until the user explicitly dismisses it
  // (× button, backdrop click, or contact-menu action). No auto-dismiss —
  // this is a conversion moment, not a passing notification. Flag is
  // written the moment the toast is triggered.
  const triggerBossToast = useCallback(() => {
    if (bossToastHideTimerRef.current) clearTimeout(bossToastHideTimerRef.current);
    setBossToast(true);
    setBossToastShown(false);
    try {
      window.localStorage.setItem(BOSS_TOAST_LS_KEY, "true");
    } catch {
      // ignore
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setBossToastShown(true));
    });
  }, []);

  const dismissBossToast = useCallback(() => {
    if (bossToastTimerRef.current) clearTimeout(bossToastTimerRef.current);
    setBossToastShown(false);
    if (bossToastHideTimerRef.current) clearTimeout(bossToastHideTimerRef.current);
    bossToastHideTimerRef.current = window.setTimeout(() => {
      setBossToast(false);
    }, 320);
  }, []);

  // Email — desktop opens Gmail compose in a new tab (most desktop users
  // don't have a default mail client). Mobile lets the <a href="mailto:">
  // do its job; iOS Safari requires a real link, not a JS-triggered nav.
  const handleEmailClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isTouchRef.current) {
        e.preventDefault();
        window.open(HIRING_GMAIL_COMPOSE, "_blank", "noopener,noreferrer");
      }
      dismissBossToast();
    },
    [dismissBossToast]
  );

  const handleCopyEmail = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(HIRING_EMAIL);
      } else {
        // Legacy fallback for browsers without async clipboard API.
        const ta = document.createElement("textarea");
        ta.value = HIRING_EMAIL;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setEmailCopied(true);
      if (emailCopiedTimerRef.current) clearTimeout(emailCopiedTimerRef.current);
      emailCopiedTimerRef.current = window.setTimeout(() => {
        setEmailCopied(false);
      }, 2000);
    } catch (err) {
      console.error("[Game] clipboard write failed", err);
    }
  }, []);

  // Keyboard
  useEffect(() => {
    const isJumpKey = (k: string) =>
      k === "ArrowUp" || k === "w" || k === "W" || k === " " || k === "Spacebar";
    const isLeft = (k: string) => k === "ArrowLeft" || k === "a" || k === "A";
    const isRight = (k: string) => k === "ArrowRight" || k === "d" || k === "D";

    const onDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (pausedRef.current) return;
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
      if (pausedRef.current) return;
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

  // showToast: pop the big toast at the top, then collapse it after
  // `durationMs`. Always updates `latestSolution` so the persistent chip
  // stays in sync with the most recently unlocked solution.
  const showToast = useCallback(
    (payload: ToastPayload, durationMs = TOAST_MS, updateChip = true) => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (toastHideTimerRef.current) clearTimeout(toastHideTimerRef.current);
      toastTimerRef.current = null;
      toastHideTimerRef.current = null;

      setToast(payload);
      setToastShown(false);
      if (updateChip) {
        setLatestSolution(payload);
        setChipKey((k) => k + 1);
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setToastShown(true));
      });
      toastTimerRef.current = window.setTimeout(() => {
        setToastShown(false);
        toastHideTimerRef.current = window.setTimeout(() => {
          setToast(null);
        }, TOAST_OUT_MS);
      }, durationMs);
    },
    []
  );

  // Game loop. Re-runs whenever the canvas element itself changes, so a
  // layout swap that remounts the canvas cleanly tears down the old rAF
  // and attaches a fresh one to the new node. Game state lives in
  // stateRef and survives the swap.
  useEffect(() => {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const sprites: Record<PlayerAnim, AnimatedSprite> = {
      idle: new AnimatedSprite(ASSETS.player.idle),
      run: new AnimatedSprite(ASSETS.player.run),
      jump: new AnimatedSprite(ASSETS.player.jump),
      fall: new AnimatedSprite(ASSETS.player.fall),
    };
    const terrainAtlas = new StaticImage(ASSETS.terrain.src);
    const flagSprite = new StaticImage(ASSETS.flag.idle);
    const enemyAtlas = new StaticImage(ASSETS.enemySheet.src);

    const platforms = level.platforms;
    const worldWidth = level.worldWidth;
    const flagX = level.flagPosition.x;
    const flagY = level.flagPosition.y;
    const sky = level.skyColor;
    const ground = level.groundColor;
    const groundDark = darken(ground, 0.25);

    const groundCols = Math.ceil(worldWidth / TILE);
    // Render extra dirt rows so the mobile -40 vertical shift doesn't expose
    // raw sky underneath the ground.
    const groundRows = Math.ceil((CANVAS_H + MOBILE_VERTICAL_SHIFT - GROUND_Y) / TILE);

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const physicsStep = () => {
      const s = stateRef.current;
      const k = keysRef.current;
      if (s.completed) return;
      // Intro card up — freeze the world. Drop any queued jump so an
      // input pressed during pause doesn't fire the moment we resume.
      if (pausedRef.current) {
        k.jumpQueued = false;
        return;
      }

      if (s.invincibleMs > 0) {
        s.invincibleMs = Math.max(0, s.invincibleMs - TICK_MS);
      }

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

        const overlap =
          s.px + PLAYER_W > e.x &&
          s.px < e.x + ENEMY_W &&
          s.py + PLAYER_H > e.y &&
          s.py < e.y + ENEMY_H;
        if (!overlap) continue;

        const playerBottom = s.py + PLAYER_H;

        if (e.isCurrentBattle) {
          // Boss: top-stomp bounces the player but doesn't kill the boss
          // (it's the "still fighting" boss). Side touch is pass-through —
          // player can navigate around it.
          if (s.vy > 0 && playerBottom - e.y < 18) {
            s.py = e.y - PLAYER_H;
            s.vy = JUMP_V * 0.6;
            s.onGround = false;
            // Trigger the special boss toast on the first stomp attempt
            // this session.
            if (!bossToastSessionRef.current && level.slug === "cars24") {
              bossToastSessionRef.current = true;
              triggerBossToast();
            }
          }
          continue;
        }

        if (s.invincibleMs > 0) continue;

        if (s.vy > 0 && playerBottom - e.y < 18) {
          e.alive = false;
          s.vy = JUMP_V * 0.6;
          setSolutions((c) => c + 1);
          showToast({ problem: e.label, solution: e.solution });
          if (!tutorialRef.current.dismissed) {
            tutorialRef.current.dismissed = true;
            tutorialRef.current.enemyId = null;
            try {
              window.localStorage.setItem(TUTORIAL_LS_KEY, "true");
            } catch {
              // ignore — incognito or storage disabled
            }
          }
        } else {
          // Respawn at point of death — keep position, briefly invincible.
          s.vx = 0;
          s.vy = 0;
          s.invincibleMs = INVINCIBLE_MS;
          break;
        }
      }

      // Tutorial trigger — any level, first non-boss enemy within range.
      // Mark seen IMMEDIATELY so the flag persists even if the user
      // navigates away mid-display.
      if (!tutorialRef.current.dismissed && !tutorialRef.current.enemyId) {
        for (const e of s.enemies) {
          if (!e.alive) continue;
          if (e.isCurrentBattle) continue; // boss has its own treatment
          if (Math.abs(s.px - e.x) < TUTORIAL_RANGE) {
            tutorialRef.current.enemyId = e.id;
            tutorialRef.current.shownAt = performance.now();
            try {
              window.localStorage.setItem(TUTORIAL_LS_KEY, "true");
            } catch {
              // ignore
            }
            break;
          }
        }
      }
      if (tutorialRef.current.enemyId) {
        const elapsed = performance.now() - tutorialRef.current.shownAt;
        if (elapsed > TUTORIAL_DURATION_MS) {
          tutorialRef.current.enemyId = null;
          tutorialRef.current.dismissed = true;
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
        setLevelCompleted(true);
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

      // Sky fill (full canvas — never shifted).
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Parallax wisp clouds (also unshifted — stay in upper background).
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 5; i++) {
        const cx =
          (((i * 600 - s.cameraX * 0.3) % (worldWidth + 400)) +
            (worldWidth + 400)) %
            (worldWidth + 400) -
          200;
        drawCloud(ctx, cx, 60 + (i % 2) * 28);
      }

      // Mobile landscape: shift world up 40px so action sits above the
      // overlaid touch buttons. In portrait the joysticks live in their own
      // dedicated zone below the canvas, so no shift is needed.
      const verticalShift =
        isTouchRef.current && !isPortraitRef.current ? -MOBILE_VERTICAL_SHIFT : 0;

      ctx.save();
      ctx.translate(-Math.round(s.cameraX), verticalShift);

      // Ground tiles.
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
        ctx.fillRect(0, GROUND_Y, worldWidth, CANVAS_H + 40 - GROUND_Y);
        ctx.fillStyle = groundDark;
        ctx.fillRect(0, GROUND_Y, worldWidth, 4);
      }

      // Floating platforms.
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
          ctx.fillRect(p.x, p.y, p.width, TILE);
        }
      }

      // Flag.
      const flagImg = flagSprite.image;
      if (flagImg) {
        const fSize = ASSETS.flag.size;
        ctx.drawImage(flagImg, flagX - fSize / 2, flagY - fSize, fSize, fSize);
      } else {
        drawFlagFallback(ctx, flagX, flagY, level.theme);
      }

      // Enemies (sprites from 20 Enemies.png crops, with rectangle fallback).
      const renderNow = performance.now();
      for (const e of s.enemies) {
        if (!e.alive) continue;
        drawEnemy(ctx, e, enemyAtlas.image, s.cameraX, renderNow);
      }

      // Tutorial hint above the chosen enemy.
      if (tutorialRef.current.enemyId) {
        const e = s.enemies.find((en) => en.id === tutorialRef.current.enemyId && en.alive);
        if (e) drawTutorialHint(ctx, e.x + ENEMY_W / 2, e.y - 38);
      }

      // Player sprite. Blink during invincibility.
      const anim = pickAnim(s);
      sprites[anim].update(frameDeltaMs);
      const flipped = facingRef.current < 0;

      let alpha = 1;
      if (s.invincibleMs > 0) {
        const phase = Math.floor(performance.now() / 100) % 2;
        alpha = phase === 0 ? 0.3 : 1;
      }
      ctx.globalAlpha = alpha;
      const drewSprite = sprites[anim].draw(
        ctx,
        Math.round(s.px),
        Math.round(s.py + PLAYER_H - 32),
        flipped
      );
      if (!drewSprite) {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(s.px, s.py, PLAYER_W, PLAYER_H);
      }
      ctx.globalAlpha = 1;

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
  }, [canvasEl, level, showToast]);

  const handleMobilePress = useCallback((key: MobileKey, down: boolean) => {
    if (key === "left") keysRef.current.left = down;
    else if (key === "right") keysRef.current.right = down;
    else if (key === "jump") {
      if (down && !keysRef.current.jump) keysRef.current.jumpQueued = true;
      keysRef.current.jump = down;
    }
  }, []);

  const noSelect = "game-no-select";
  const showBanner = isTouch && isPortrait && !bannerDismissed;

  // Reusable canvas element — uses the callback ref so the game loop's
  // useEffect re-runs if React remounts the element across layout swaps.
  const canvasNode = (className: string, extraStyle?: React.CSSProperties) => (
    <canvas
      ref={canvasRefCallback}
      width={CANVAS_W}
      height={CANVAS_H}
      tabIndex={0}
      onClick={(e) => e.currentTarget.focus()}
      className={`outline-none [image-rendering:pixelated] ${noSelect} ${className}`}
      style={{ touchAction: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none", ...extraStyle }}
      aria-label={`${level.locationName} game canvas`}
    />
  );

  const toastEl = toast && !levelCompleted ? (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none absolute left-1/2 top-10 z-30 w-[min(360px,90%)] sm:top-12 ${noSelect}`}
      style={{
        animation: toastShown
          ? "lootDropIn 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards"
          : `lootCollapseToChip ${TOAST_OUT_MS}ms ease-in forwards`,
      }}
    >
      <div
        className="rounded-md border-2 bg-zinc-950/95 px-4 py-3 shadow-2xl backdrop-blur"
        style={{ borderColor: "#f5c518" }}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="text-amber-400" aria-hidden>★</span>
          <span className="font-pixel text-[10px] uppercase tracking-[0.2em] text-amber-300">
            Solution Unlocked
          </span>
        </div>
        <div className="space-y-1 font-mono text-[11px] leading-snug text-zinc-200 sm:text-xs">
          <p><span className="text-zinc-500">Problem:</span> {toast.problem}</p>
          <p><span className="text-zinc-500">Solution:</span> {toast.solution}</p>
        </div>
        <div className="mt-3 flex justify-end">
          <span className="rounded-sm border border-amber-400/60 bg-amber-400/15 px-2 py-0.5 font-pixel text-[9px] uppercase tracking-widest text-amber-200">
            +1 Solution
          </span>
        </div>
      </div>
    </div>
  ) : null;

  // Chip position varies by layout.
  const chipStyle: React.CSSProperties = (() => {
    if (isTouch && isPortrait) return { top: 8, left: 8 };
    if (isTouch && !isPortrait) return { bottom: 88, left: 16 };
    return { bottom: 16, left: 16 };
  })();

  const chipEl = !levelCompleted && latestSolution ? (
    <button
      key={chipKey}
      type="button"
      onClick={() => showToast(latestSolution, TOAST_REEXPAND_MS, false)}
      aria-label={`Re-show solution: ${latestSolution.problem}`}
      className={`absolute z-20 flex max-w-[60%] items-center gap-1.5 rounded-md border-2 bg-zinc-950/90 px-2.5 py-1.5 text-left shadow-lg backdrop-blur transition hover:bg-zinc-950 ${noSelect}`}
      style={{
        borderColor: "#f5c518",
        ...chipStyle,
        animation: "chipFadeIn 0.35s ease-out backwards, chipPulse 1.1s ease-in-out 0s 3",
      }}
    >
      <span className="text-amber-400" aria-hidden>★</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-amber-200">
        Last solved:
      </span>
      <span className="truncate font-mono text-[11px] text-zinc-100">
        {latestSolution.problem}
      </span>
    </button>
  ) : null;

  // Intro card overlay — fixed across all layouts.
  const levelIndex = Math.max(0, ALL_LEVELS.findIndex((l) => l.slug === level.slug));
  const introEl = showIntro ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-card-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 game-no-select"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={dismissIntro}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] rounded-md border border-zinc-700 bg-zinc-950 p-6 text-center shadow-2xl sm:p-7"
        style={{ borderTopColor: level.theme, borderTopWidth: 4 }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 sm:text-xs">
          Level {levelIndex + 1} · {level.company}
        </p>
        <h2
          id="intro-card-title"
          className="mt-3 font-pixel text-base leading-[1.4] text-white sm:text-lg"
        >
          PROBLEMS PATROL THIS LEVEL
        </h2>
        <p className="mt-4 font-mono text-xs leading-relaxed text-zinc-300 sm:text-sm">
          Jump on a problem to defeat it. Each defeat unlocks a real solution
          I shipped.
        </p>
        <button
          type="button"
          onClick={dismissIntro}
          className="mt-6 rounded-sm border border-amber-300 bg-amber-300 px-5 py-2 font-pixel text-[10px] uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-amber-200"
        >
          Enter Level →
        </button>
      </div>
    </div>
  ) : null;

  // Boss "still fighting" toast — first stomp on the Cars24 boss only.
  // No auto-dismiss: user closes via ×, backdrop tap, or the CTA. The
  // mailto CTA is an <a> so iOS Safari treats it as a user-initiated
  // link; the onClick still runs and dismisses the toast.
  const bossToastEl = bossToast ? (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="boss-toast-title"
      className="fixed inset-0 z-40 flex items-start justify-center px-4 pt-6 game-no-select"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={dismissBossToast}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:w-[400px]"
        style={{
          maxWidth: "calc(100vw - 32px)",
          animation: bossToastShown
            ? "lootDropIn 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards"
            : "lootDropOut 0.3s ease-in forwards",
          transformOrigin: "top center",
        }}
      >
        <div
          className="rounded-md border bg-[rgba(15,15,15,0.96)] p-4 shadow-2xl backdrop-blur sm:p-5"
          style={{ borderColor: "#DC2626" }}
        >
          <button
            type="button"
            onClick={dismissBossToast}
            aria-label="Dismiss"
            className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-md text-base leading-none text-white transition hover:bg-[rgba(255,255,255,0.1)]"
          >
            ×
          </button>
          <div className="mb-2 flex items-center gap-2 pr-8">
            <span className="text-red-500" aria-hidden>⚠</span>
            <span
              id="boss-toast-title"
              className="font-pixel text-[11px] uppercase tracking-[0.2em] text-red-400"
            >
              Still Fighting This One
            </span>
          </div>
          <div className="space-y-1 font-mono text-xs leading-relaxed text-white sm:text-[13px]">
            <p>This is the problem I&apos;m solving today.</p>
            <p>The level after this is up to whoever hires me next.</p>
          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400">
            Pick your channel:
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <a
              href={HIRING_MAILTO}
              onClick={handleEmailClick}
              className="flex items-center gap-3 rounded-md px-4 py-2.5 font-pixel text-[11px] uppercase tracking-[0.18em] text-white transition"
              style={{ background: "#DC2626" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#B91C1C")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#DC2626")}
            >
              <span className="text-base" aria-hidden>✉</span>
              <span className="flex-1 text-left">Email me directly</span>
              <span aria-hidden>→</span>
            </a>

            <button
              type="button"
              onClick={handleCopyEmail}
              aria-live="polite"
              className="flex items-center gap-3 rounded-md border border-white/15 bg-white/5 px-4 py-2.5 font-pixel text-[11px] uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
            >
              <span className="text-base" aria-hidden>
                {emailCopied ? "✓" : "📋"}
              </span>
              <span className="flex-1 text-left">
                {emailCopied ? "Copied!" : "Copy my email"}
              </span>
            </button>

            <a
              href={HIRING_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismissBossToast}
              className="flex items-center gap-3 rounded-md border border-white/15 bg-white/5 px-4 py-2.5 font-pixel text-[11px] uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
            >
              <span
                className="grid h-5 w-5 place-items-center rounded-sm font-bold"
                style={{ background: "#0A66C2", fontSize: 10 }}
                aria-hidden
              >
                in
              </span>
              <span className="flex-1 text-left">LinkedIn DM</span>
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  // ─── PORTRAIT (touch + portrait): HUD bar / canvas / joystick zone ─────
  if (isTouch && isPortrait) {
    return (
      <div className={`fixed inset-0 flex flex-col bg-black text-zinc-100 ${noSelect}`} style={{ height: "100dvh" }}>
        {/* HUD strip */}
        <div className={`flex items-center justify-between border-b border-white/10 bg-zinc-950 px-3 py-2 ${noSelect}`}>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white">
              {level.company}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
              Solutions: {solutions} / {level.enemies.length}
            </span>
          </div>
          <Link
            href="/resume"
            className="rounded-md border border-white/20 bg-black/55 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-white"
          >
            Skip →
          </Link>
        </div>

        {/* Dismissible rotate banner */}
        {showBanner && (
          <div className={`flex items-center justify-between border-b border-white/10 bg-black/55 px-3 py-1.5 backdrop-blur ${noSelect}`}>
            <span className="font-mono text-[10px] text-white">
              ↻ Rotate phone for fullscreen experience
            </span>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Dismiss banner"
              className="ml-2 px-1 text-base leading-none text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {/* Canvas zone — flex-1 with explicit min-height so it always has
            a real height inside the column, even before children fill in.
            Canvas fills the zone with object-contain so the 2:1 game
            content letterboxes neatly when the zone is taller than wide
            (which is common in portrait). */}
        <div
          className={`relative flex-1 overflow-hidden bg-black ${noSelect}`}
          style={{ minHeight: 200 }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1"
            style={{ background: level.theme }}
            aria-hidden
          />
          {canvasNode("absolute inset-0 block h-full w-full object-contain")}
          {toastEl}
          {chipEl}
        </div>

        {/* Joystick zone */}
        <div className={`relative bg-black border-t border-white/10 ${noSelect}`} style={{ height: 120 }}>
          <MobileControls onPress={handleMobilePress} />
        </div>

        {introEl}
        {bossToastEl}
      </div>
    );
  }

  // ─── LANDSCAPE TOUCH or DESKTOP (single shared structure) ──────────────
  return (
    <div
      className={
        isTouch
          ? `fixed inset-0 overflow-hidden bg-black text-zinc-100 ${noSelect}`
          : `relative w-full bg-zinc-950 px-2 pb-6 pt-3 text-zinc-100 sm:px-4 ${noSelect}`
      }
    >
      <div
        className={
          isTouch
            ? `absolute inset-0 overflow-hidden bg-black ${noSelect}`
            : `relative mx-auto w-full max-w-[960px] overflow-hidden rounded-md border border-zinc-800 shadow-xl ${noSelect}`
        }
        style={isTouch ? undefined : { aspectRatio: "2 / 1" }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1.5"
          style={{ background: level.theme }}
          aria-hidden
        />

        {canvasNode(
          isTouch
            ? "absolute inset-0 block h-full w-full object-cover"
            : "block h-auto w-full max-w-[100vw]",
          isTouch ? undefined : { aspectRatio: "2 / 1" }
        )}

        <div className={`pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-1 sm:left-4 sm:top-4 ${noSelect}`}>
          <div className={`rounded-md border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white shadow backdrop-blur sm:text-xs ${noSelect}`}>
            {level.company}
          </div>
          <div className={`rounded-md border border-white/15 bg-black/55 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white shadow backdrop-blur sm:text-[11px] ${noSelect}`}>
            Solutions unlocked: {solutions} / {level.enemies.length}
          </div>
        </div>

        <Link
          href="/resume"
          className={`absolute right-3 top-3 z-20 rounded-md border border-white/20 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white shadow backdrop-blur transition hover:bg-black/80 sm:right-4 sm:top-4 sm:text-xs ${noSelect}`}
        >
          Skip the game, see resume →
        </Link>

        {toastEl}
        {chipEl}

        {isTouch && <MobileControls onPress={handleMobilePress} />}
      </div>

      {!isTouch && (
        <p className={`mx-auto mt-3 max-w-[960px] text-center font-mono text-[10px] uppercase tracking-widest text-zinc-500 sm:text-xs ${noSelect}`}>
          Arrow keys / A·D to move · ↑ / W / Space to jump
        </p>
      )}

      {introEl}
      {bossToastEl}
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

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  e: EnemyState,
  atlas: HTMLImageElement | null,
  cameraX: number,
  now: number
) {
  const drawSize = e.spriteSize;
  const drawX = e.x + ENEMY_W / 2 - drawSize / 2;
  const drawY = e.y + ENEMY_H - drawSize;

  // Boss aura — pulsing red radial gradient behind the sprite.
  if (e.isCurrentBattle) {
    const cx = drawX + drawSize / 2;
    const cy = drawY + drawSize / 2;
    const radius = drawSize * 0.7; // 1.4x sprite radius
    const pulse = 0.4 + Math.sin(now / 200) * 0.2; // 0.2 ↔ 0.6
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, `rgba(220, 38, 38, ${pulse})`);
    gradient.addColorStop(1, "rgba(220, 38, 38, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  }

  // Sprite (or rectangle fallback during atlas load).
  if (atlas) {
    const crop = ASSETS.enemySheet.crops[e.spriteKey];
    ctx.drawImage(atlas, crop.sx, crop.sy, crop.sw, crop.sh, drawX, drawY, drawSize, drawSize);
  } else {
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(e.x, e.y, ENEMY_W, ENEMY_H);
  }

  // Boss lock icon — top-right corner of sprite.
  if (e.isCurrentBattle) {
    drawLockIcon(ctx, drawX + drawSize - 14, drawY + 2, 12);
  }

  // ─── Label pill(s) — clamped within camera viewport so nothing crops.
  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const drawPill = (
    text: string,
    midY: number,
    bg: string,
    fg: string,
    border?: string
  ) => {
    const tw = ctx.measureText(text).width;
    const padding = 8;
    const pillW = tw + padding * 2;
    const pillH = 18;
    const desiredX = e.x + ENEMY_W / 2 - pillW / 2;
    const minX = cameraX + 4;
    const maxX = cameraX + CANVAS_W - 4 - pillW;
    const pillX = Math.round(clamp(desiredX, minX, maxX));
    const pillY = Math.round(midY - pillH / 2);
    ctx.fillStyle = bg;
    ctx.fillRect(pillX, pillY, pillW, pillH);
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.strokeRect(pillX + 0.5, pillY + 0.5, pillW - 1, pillH - 1);
    }
    ctx.fillStyle = fg;
    ctx.fillText(text, pillX + pillW / 2, midY + 0.5);
  };

  if (e.isCurrentBattle) {
    // Top: BOSS pill (red).
    drawPill("BOSS · STILL ALIVE", drawY - 22, "rgba(127,29,29,0.95)", "#FFFFFF", "#DC2626");
    // Below sprite: small muted problem-name pill.
    drawPill(e.label, drawY + drawSize + 14, "rgba(0,0,0,0.7)", "#cbd5e1");
  } else {
    drawPill(`PROBLEM: ${e.label}`, e.y - 18, "rgba(0,0,0,0.85)", "#FFFFFF");
  }

  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

// Tiny pixel padlock — drawn with rectangles. Red body, white shackle.
function drawLockIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  const bodyH = Math.round(size * 0.6);
  const bodyY = y + size - bodyH;
  // White outline ring around body
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x - 1, bodyY - 1, size + 2, bodyH + 2);
  // Red body
  ctx.fillStyle = "#DC2626";
  ctx.fillRect(x, bodyY, size, bodyH);
  // Shackle — three rectangles approximating a U-shape, white outlined
  const shackleH = Math.round(size * 0.55);
  const shackleW = Math.round(size * 0.65);
  const shackleX = x + Math.round((size - shackleW) / 2);
  const shackleY = y;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(shackleX - 1, shackleY - 1, shackleW + 2, 3);
  ctx.fillRect(shackleX - 1, shackleY - 1, 3, shackleH);
  ctx.fillRect(shackleX + shackleW - 2, shackleY - 1, 3, shackleH);
  ctx.fillStyle = "#DC2626";
  ctx.fillRect(shackleX, shackleY, shackleW, 1);
  ctx.fillRect(shackleX, shackleY, 1, shackleH - 1);
  ctx.fillRect(shackleX + shackleW - 1, shackleY, 1, shackleH - 1);
}

function drawTutorialHint(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number
) {
  const text = "↑ JUMP ON THEM";
  ctx.font = "bold 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const tw = ctx.measureText(text).width;
  const padding = 10;
  const pillW = tw + padding * 2;
  const pillH = 22;
  const pillX = Math.round(centerX - pillW / 2);
  const pillY = Math.round(centerY - pillH / 2);
  // Subtle bob.
  const bob = Math.sin(performance.now() / 240) * 2;
  ctx.fillStyle = "rgba(245,197,24,0.95)";
  ctx.fillRect(pillX, pillY + bob, pillW, pillH);
  ctx.fillStyle = "#1a1208";
  ctx.fillText(text, centerX, centerY + bob + 0.5);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}
