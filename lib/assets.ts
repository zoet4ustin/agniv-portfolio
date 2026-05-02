// Centralized asset config. Swap in custom art by editing this file —
// game logic should never reference sprite paths directly.

export type AnimSpriteConfig = {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  fps: number;
};

export type TileAtlasConfig = {
  src: string;
  // Source coordinates (px) for each named 16x16 tile in the atlas.
  // Picked from Pixel Frog's Terrain (16x16).png by visual inspection.
  tiles: {
    grassTop: { x: number; y: number };
    dirtFill: { x: number; y: number };
    platform: { x: number; y: number };
  };
  tileSize: number;
};

export const ASSETS = {
  player: {
    idle: {
      src: "/sprites/Main Characters/Mask Dude/Idle (32x32).png",
      frameWidth: 32,
      frameHeight: 32,
      frames: 11,
      fps: 12,
    },
    run: {
      src: "/sprites/Main Characters/Mask Dude/Run (32x32).png",
      frameWidth: 32,
      frameHeight: 32,
      frames: 12,
      fps: 16,
    },
    jump: {
      src: "/sprites/Main Characters/Mask Dude/Jump (32x32).png",
      frameWidth: 32,
      frameHeight: 32,
      frames: 1,
      fps: 1,
    },
    fall: {
      src: "/sprites/Main Characters/Mask Dude/Fall (32x32).png",
      frameWidth: 32,
      frameHeight: 32,
      frames: 1,
      fps: 1,
    },
  } satisfies Record<string, AnimSpriteConfig>,

  // Pixel Adventure 1 ships only a "20 Enemies.png" preview poster — not
  // individual animatable spritesheets. Until proper enemy sheets are
  // dropped under public/sprites/Enemies/, Game.tsx renders enemies as
  // pixel-styled rectangles. Populate the entries below to switch over.
  enemies: {
    default: null as AnimSpriteConfig | null,
    boss: null as AnimSpriteConfig | null,
  },

  terrain: {
    src: "/sprites/Terrain/Terrain (16x16).png",
    tileSize: 16,
    tiles: {
      // Grass-top middle tile (within the green grass terrain set).
      grassTop: { x: 112, y: 0 },
      // Dirt fill tile (one row below the grass top).
      dirtFill: { x: 112, y: 16 },
      // Red brick fill — used for floating platforms.
      platform: { x: 256, y: 80 },
    },
  } satisfies TileAtlasConfig,

  flag: {
    // Single-frame 64x64 image; drawn unscaled at the flag location.
    idle: "/sprites/Items/Checkpoints/End/End (Idle).png",
    pressed: "/sprites/Items/Checkpoints/End/End (Pressed) (64x64).png",
    size: 64,
  },

  background: {
    // Optional 64x64 tileable swatches. Currently we draw the per-level
    // skyColor as a solid base; backgrounds here are reserved for a future
    // parallax layer.
    blue: "/sprites/Background/Blue.png",
    purple: "/sprites/Background/Purple.png",
    pink: "/sprites/Background/Pink.png",
    yellow: "/sprites/Background/Yellow.png",
  },
} as const;
