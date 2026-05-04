// Centralized asset config. Swap in custom art by editing this file —
// game logic should never reference sprite paths directly.

export type AnimSpriteConfig = {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  fps: number;
};

export type EnemyCrop = {
  src: string;
  // Source bounding box in the spritesheet (px).
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export type TileAtlasConfig = {
  src: string;
  // Source coordinates (px) for each named 16x16 tile in the atlas.
  // The atlas is laid out as 3 macro rows of terrain sets, each set
  // 5 tiles × 3 tiles, separated by spacer rows at y=48 and y=112.
  // Within a 5-col set, col 2 (offset +32 from set's left edge) is the
  // true centre fill — that's what we want for repeating surfaces.
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

  // Crops from /sprites/20 Enemies.png — the pack ships only this preview
  // poster (630x500), no per-enemy spritesheets. Watermark band runs
  // y≈215-250 between rows 2 and 3 and does not touch any enemy. Crops
  // were measured against the 5-col × 4-row layout inside the wood frame.
  enemySheet: {
    src: "/sprites/20 Enemies.png",
    crops: {
      mushroom:    { sx: 35,  sy: 45,  sw: 80, sh: 75 },
      trunk:       { sx: 150, sy: 50,  sw: 80, sh: 75 },
      snail:       { sx: 20,  sy: 140, sw: 95, sh: 70 },
      ghost:       { sx: 395, sy: 145, sw: 75, sh: 65 },
      rhino:       { sx: 280, sy: 270, sw: 95, sh: 75 },
      skullCircle: { sx: 155, sy: 365, sw: 95, sh: 100 },
    },
  },

  terrain: {
    src: "/sprites/Terrain/Terrain (16x16).png",
    tileSize: 16,
    tiles: {
      // Grass-top middle tile (within green grass set, cols 5-9, row 0).
      grassTop: { x: 112, y: 0 },
      // Dirt fill below grass-top (same column, row 1).
      dirtFill: { x: 112, y: 16 },
      // Gray-brick centre fill (gray brick set occupies cols 10-14 in the
      // middle macro row at rows 4-6; col 12 row 5 is the seamless fill).
      platform: { x: 192, y: 80 },
    },
  } satisfies TileAtlasConfig,

  flag: {
    idle: "/sprites/Items/Checkpoints/End/End (Idle).png",
    pressed: "/sprites/Items/Checkpoints/End/End (Pressed) (64x64).png",
    size: 64,
  },

  background: {
    blue: "/sprites/Background/Blue.png",
    purple: "/sprites/Background/Purple.png",
    pink: "/sprites/Background/Pink.png",
    yellow: "/sprites/Background/Yellow.png",
  },
} as const;

export type EnemySpriteKey = keyof typeof ASSETS.enemySheet.crops;
