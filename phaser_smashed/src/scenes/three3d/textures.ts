import * as THREE from 'three';

////////////////////////////////////////////////////////////
// Texture helpers for the pseudo-3D renderer.
//
// Two kinds of textures are used:
//  1. The game's real 2D image assets (bricks, lava, flag,
//     backgrounds ...) loaded straight from public/images so
//     the 3D world keeps the exact same art direction.
//  2. Small procedural canvas textures (denim, shell plates,
//     metal ...) for surfaces that only exist in 3D, like the
//     sides of characters and props.
////////////////////////////////////////////////////////////

const imageTextureCache: Map<string, THREE.Texture> = new Map();
const canvasTextureCache: Map<string, THREE.CanvasTexture> = new Map();
const sharedLoader = new THREE.TextureLoader();

export function getImageTexture(
  url: string,
  options?: { repeat?: boolean; smooth?: boolean }
): THREE.Texture {
  const cacheKey =
    url + '|' + (options?.repeat ? 'r' : '') + (options?.smooth ? 's' : '');
  const cached = imageTextureCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const texture = sharedLoader.load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!options?.smooth) {
    // Keep the pixel-art look of the original assets.
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
  }
  if (options?.repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  }
  imageTextureCache.set(cacheKey, texture);
  return texture;
}

function makeCanvasTexture(
  key: string,
  size: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void
): THREE.CanvasTexture {
  const cached = canvasTextureCache.get(key);
  if (cached) {
    return cached;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx, size);
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

export function disposeAllCachedTextures(): void {
  imageTextureCache.forEach((texture) => texture.dispose());
  imageTextureCache.clear();
  canvasTextureCache.forEach((texture) => texture.dispose());
  canvasTextureCache.clear();
}
