import type { AnimSpriteConfig } from "./assets";

// AnimatedSprite — small wrapper around a horizontal spritesheet.
// Owns its image element + playhead. Game code calls update(dt) once per
// frame, then draw(ctx, x, y, flipped).
export class AnimatedSprite {
  private img: HTMLImageElement;
  private cfg: AnimSpriteConfig;
  private elapsedMs = 0;
  private loaded = false;
  private failed = false;

  constructor(cfg: AnimSpriteConfig) {
    this.cfg = cfg;
    this.img = new Image();
    this.img.onload = () => {
      this.loaded = true;
    };
    this.img.onerror = () => {
      this.failed = true;
      // Surface clearly in dev — silent fallbacks were explicitly disallowed.
      console.error(`[AnimatedSprite] failed to load: ${cfg.src}`);
    };
    this.img.src = cfg.src;
  }

  isLoaded() {
    return this.loaded;
  }

  hasFailed() {
    return this.failed;
  }

  reset() {
    this.elapsedMs = 0;
  }

  update(deltaMs: number) {
    this.elapsedMs += deltaMs;
  }

  // Returns true if it actually drew something.
  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    flipped = false,
    drawW?: number,
    drawH?: number
  ): boolean {
    if (!this.loaded) return false;
    const w = drawW ?? this.cfg.frameWidth;
    const h = drawH ?? this.cfg.frameHeight;
    const frameIdx =
      this.cfg.frames <= 1
        ? 0
        : Math.floor((this.elapsedMs * this.cfg.fps) / 1000) % this.cfg.frames;
    const sx = frameIdx * this.cfg.frameWidth;

    if (flipped) {
      ctx.save();
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.img,
        sx,
        0,
        this.cfg.frameWidth,
        this.cfg.frameHeight,
        0,
        0,
        w,
        h
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        this.img,
        sx,
        0,
        this.cfg.frameWidth,
        this.cfg.frameHeight,
        x,
        y,
        w,
        h
      );
    }
    return true;
  }
}

// Tiny helper for static (non-animated) images. Lets us reuse the same
// "is loaded?" pattern.
export class StaticImage {
  private img: HTMLImageElement;
  private loaded = false;
  private failed = false;
  readonly src: string;

  constructor(src: string) {
    this.src = src;
    this.img = new Image();
    this.img.onload = () => {
      this.loaded = true;
    };
    this.img.onerror = () => {
      this.failed = true;
      console.error(`[StaticImage] failed to load: ${src}`);
    };
    this.img.src = src;
  }

  isLoaded() {
    return this.loaded;
  }

  hasFailed() {
    return this.failed;
  }

  get image(): HTMLImageElement | null {
    return this.loaded ? this.img : null;
  }
}
