import * as THREE from 'three';

////////////////////////////////////////////////////////////
// Procedural textures for the pseudo-3D renderer.
//
// The 3D mode deliberately uses NO original 2D image assets:
// every surface is drawn onto small canvases at runtime. A
// shared THEME palette keeps the whole world cohesive — warm
// terracotta masonry, cream trim, slate metal, molten golds.
////////////////////////////////////////////////////////////

export const THEME = {
  brick: '#c96f3b',
  brickDark: '#9c5028',
  brickLight: '#e08a4e',
  mortar: '#e8d9b0',
  stone: '#8a7360',
  stoneDark: '#5e4d3e',
  metal: '#3d4450',
  metalLight: '#5a6472',
  metalDark: '#23272f',
  cream: '#f4f0e0',
  gold: '#f2c218',
  lavaHot: '#ffdd33',
  lava: '#ff5511',
  lavaDeep: '#a81800',
  grass: '#4e9636',
  grassDark: '#356b24',
  skyTop: '#3a63c4',
  skyHorizon: '#a8d4ec',
  cloud: '#ffffff',
};

const canvasTextureCache: Map<string, THREE.CanvasTexture> = new Map();

function makeCanvasTexture(
  key: string,
  size: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void
): THREE.CanvasTexture {
  return makeCanvasTextureWH(key, size, size, (ctx) => draw(ctx, size));
}

export function makeCanvasTextureWH(
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  const cached = canvasTextureCache.get(key);
  if (cached) {
    return cached;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx, width, height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  canvasTextureCache.set(key, texture);
  return texture;
}

// deterministic pseudo-random for texture noise
function noiseValue(x: number, y: number): number {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

function sprinkleNoise(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
  amount: number,
  alpha: number
): void {
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  for (let i = 0; i < amount; i++) {
    const x = Math.floor(noiseValue(i, 1) * size);
    const y = Math.floor(noiseValue(1, i) * size);
    const s = 1 + Math.floor(noiseValue(i, i) * 3);
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;
}

/** Woven cloth with subtle noise — used for shirts / tunics. */
export function getClothTexture(hexColor: string): THREE.CanvasTexture {
  return makeCanvasTexture('cloth_' + hexColor, 64, (ctx, size) => {
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, size, size);
    sprinkleNoise(ctx, size, '#000000', 140, 0.06);
    sprinkleNoise(ctx, size, '#ffffff', 90, 0.05);
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#000000';
    for (let y = 0; y < size; y += 4) {
      ctx.fillRect(0, y, size, 1);
    }
    ctx.globalAlpha = 1;
  });
}

/** Denim with stitch lines — used for overalls / jeans. */
export function getDenimTexture(hexColor: string): THREE.CanvasTexture {
  return makeCanvasTexture('denim_' + hexColor, 64, (ctx, size) => {
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, size, size);
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    for (let d = -size; d < size * 2; d += 6) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + size, size);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    sprinkleNoise(ctx, size, '#000000', 120, 0.08);
  });
}

/** Turtle-shell plates — hex-ish plate pattern over a base color. */
export function getShellTexture(hexColor: string): THREE.CanvasTexture {
  return makeCanvasTexture('shell_' + hexColor, 128, (ctx, size) => {
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 3;
    const step = size / 4;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const offsetX = row % 2 === 0 ? 0 : step / 2;
        const x = col * step + offsetX;
        const y = row * step;
        ctx.strokeRect(x + 2, y + 2, step - 4, step - 4);
      }
    }
    sprinkleNoise(ctx, size, '#ffffff', 100, 0.07);
  });
}

/** Brushed metal — used for hammer heads, chains, spikes. */
export function getMetalTexture(hexColor: string): THREE.CanvasTexture {
  return makeCanvasTexture('metal_' + hexColor, 64, (ctx, size) => {
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y++) {
      const brightness = noiseValue(3, y);
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = brightness > 0.5 ? '#ffffff' : '#000000';
      ctx.fillRect(0, y, size, 1);
    }
    ctx.globalAlpha = 1;
  });
}

/** Wood grain — table top, hammer handles. */
export function getWoodTexture(hexColor: string): THREE.CanvasTexture {
  return makeCanvasTexture('wood_' + hexColor, 64, (ctx, size) => {
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, size, size);
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#000000';
    for (let i = 0; i < 8; i++) {
      const y = (i / 8) * size + noiseValue(i, 0) * 6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        size * 0.3,
        y + 4,
        size * 0.6,
        y - 4,
        size,
        y + noiseValue(0, i) * 5
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    sprinkleNoise(ctx, size, '#000000', 60, 0.08);
  });
}

/** Fur / hide with dense speckle — Pikachu, Monkee, Chomp. */
export function getFurTexture(hexColor: string): THREE.CanvasTexture {
  return makeCanvasTexture('fur_' + hexColor, 64, (ctx, size) => {
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, size, size);
    sprinkleNoise(ctx, size, '#000000', 220, 0.07);
    sprinkleNoise(ctx, size, '#ffffff', 160, 0.06);
  });
}

////////////////////////////////////////////////////////////
// STAGE SURFACES (all hand-drawn — no original game assets)
////////////////////////////////////////////////////////////

/**
 * Running-bond brick pattern in the theme terracotta. One tile is
 * 2 bricks wide x 2 courses tall (66x68 world px) so meshes can set
 * repeat = size / tile to keep bricks the same size everywhere.
 */
export function getBrickPatternTexture(
  variant: 'warm' | 'dark' | 'stone'
): THREE.CanvasTexture {
  const base =
    variant === 'warm'
      ? THEME.brick
      : variant === 'dark'
      ? THEME.brickDark
      : THEME.stone;
  const shade =
    variant === 'warm'
      ? THEME.brickDark
      : variant === 'dark'
      ? '#6e3a1c'
      : THEME.stoneDark;
  const light = variant === 'warm' ? THEME.brickLight : THEME.metalLight;

  return makeCanvasTextureWH('bricks_' + variant, 66, 68, (ctx, w, h) => {
    ctx.fillStyle = THEME.mortar;
    ctx.fillRect(0, 0, w, h);
    const brickW = 33;
    const brickH = 34;
    const gap = 3;
    for (let row = 0; row < 2; row++) {
      const offsetX = row % 2 === 0 ? 0 : -brickW / 2;
      for (let col = -1; col < 3; col++) {
        const x = col * brickW + offsetX + gap / 2;
        const y = row * brickH + gap / 2;
        ctx.fillStyle = base;
        ctx.fillRect(x, y, brickW - gap, brickH - gap);
        // top-left bevel highlight, bottom-right shadow
        ctx.fillStyle = light;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x, y, brickW - gap, 3);
        ctx.fillRect(x, y, 3, brickH - gap);
        ctx.globalAlpha = 1;
        ctx.fillStyle = shade;
        ctx.globalAlpha = 0.55;
        ctx.fillRect(x, y + brickH - gap - 3, brickW - gap, 3);
        ctx.fillRect(x + brickW - gap - 3, y, 3, brickH - gap);
        ctx.globalAlpha = 1;
      }
    }
    sprinkleNoise(ctx, Math.min(w, h), '#000000', 40, 0.05);
  });
}

/** A single weathered block with a lightning crack, tiled per block. */
export function getCrackedBlockTexture(): THREE.CanvasTexture {
  return makeCanvasTextureWH('cracked_block', 33, 34, (ctx, w, h) => {
    ctx.fillStyle = THEME.brickLight;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = THEME.brick;
    ctx.fillRect(2, 2, w - 4, h - 4);
    // bevel
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.25;
    ctx.fillRect(2, 2, w - 4, 3);
    ctx.fillRect(2, 2, 3, h - 4);
    ctx.globalAlpha = 1;
    ctx.fillStyle = THEME.brickDark;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(2, h - 5, w - 4, 3);
    ctx.fillRect(w - 5, 2, 3, h - 4);
    ctx.globalAlpha = 1;
    // crack
    ctx.strokeStyle = THEME.brickDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.55, 3);
    ctx.lineTo(w * 0.4, h * 0.35);
    ctx.lineTo(w * 0.6, h * 0.55);
    ctx.lineTo(w * 0.45, h * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.4, h * 0.35);
    ctx.lineTo(w * 0.22, h * 0.5);
    ctx.stroke();
  });
}

/** Diamond-plate studded steel for the arena boundary. */
export function getStuddedMetalTexture(): THREE.CanvasTexture {
  return makeCanvasTextureWH('studded_metal', 64, 64, (ctx, w, h) => {
    ctx.fillStyle = THEME.metal;
    ctx.fillRect(0, 0, w, h);
    const step = 16;
    for (let row = 0; row < h / step; row++) {
      for (let col = 0; col < w / step; col++) {
        const cx = col * step + (row % 2 === 0 ? step / 2 : 0);
        const cy = row * step + step / 2;
        // raised diamond stud
        ctx.beginPath();
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx + 5, cy);
        ctx.lineTo(cx, cy + 5);
        ctx.lineTo(cx - 5, cy);
        ctx.closePath();
        ctx.fillStyle = THEME.metalLight;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx + 5, cy);
        ctx.lineTo(cx, cy);
        ctx.closePath();
        ctx.fillStyle = '#7d8898';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy + 5);
        ctx.lineTo(cx - 5, cy);
        ctx.closePath();
        ctx.fillStyle = THEME.metalDark;
        ctx.fill();
      }
    }
    sprinkleNoise(ctx, w, '#000000', 60, 0.08);
  });
}

/** Molten lava: dark crust islands over glowing channels. Scrolled per frame. */
export function getLavaTexture(): THREE.CanvasTexture {
  return makeCanvasTextureWH('lava', 128, 128, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, THEME.lavaHot);
    gradient.addColorStop(0.5, THEME.lava);
    gradient.addColorStop(1, THEME.lavaHot);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    // dark crust blobs
    ctx.fillStyle = THEME.lavaDeep;
    for (let i = 0; i < 26; i++) {
      const x = noiseValue(i, 7) * w;
      const y = noiseValue(13, i) * h;
      const r = 4 + noiseValue(i, i + 3) * 11;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.5, r, 0, 0, Math.PI * 2);
      ctx.fill();
      // wrap blobs across edges so the tile repeats seamlessly-ish
      ctx.beginPath();
      ctx.ellipse(x - w, y, r * 1.5, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x, y - h, r * 1.5, r, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // hot sparks
    sprinkleNoise(ctx, w, THEME.lavaHot, 90, 0.8);
  });
}

/** Capture-the-flag cloth: cream banner, terracotta border, bold "?". */
export function getFlagTexture(): THREE.CanvasTexture {
  return makeCanvasTextureWH('flag_cloth', 96, 96, (ctx, w, h) => {
    ctx.fillStyle = THEME.cream;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = THEME.brick;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = THEME.metalDark;
    ctx.font = 'bold 58px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', w / 2, h / 2 + 4);
    sprinkleNoise(ctx, w, '#000000', 50, 0.04);
  });
}

/** Rolling-hill grass with mown stripes for the far background. */
export function getGrassTexture(dark: boolean): THREE.CanvasTexture {
  const base = dark ? THEME.grassDark : THEME.grass;
  return makeCanvasTextureWH('grass_' + dark, 128, 64, (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
      ctx.fillRect((i * w) / 8, 0, w / 16, h);
    }
    ctx.globalAlpha = 1;
    sprinkleNoise(ctx, Math.min(w, h), '#1e3d12', 180, 0.1);
  });
}

export function disposeAllCachedTextures(): void {
  canvasTextureCache.forEach((texture) => texture.dispose());
  canvasTextureCache.clear();
}
