/**
 * LOTADOR - Sprite Atlas Slicer & Texture Manager
 *
 * IMPORTANT (audit note): the "main" placeholder reference sheet the
 * project used to ship with does not exist / does not reliably match the
 * frame coordinates in `atlasData.ts`, which is exactly what caused
 * characters and props to render cropped, squashed, or showing raw
 * background. Rather than depend on a fragile hand-mapped image for ~100
 * sprite keys, every 'main' sprite is drawn procedurally on a <canvas>
 * with clean vector shapes — 100% reliable, no cropping, so no
 * background/label artifacts can ever leak through.
 *
 * The player character ("Nelo"/CÁÇA) is the one sprite family backed by a
 * real, verified image: `player1_spritesheet.png`. Its frame coordinates
 * in atlasData.ts were measured directly (pixel-exact, via alpha-channel
 * bounding box detection) from that actual file, so cropping it is safe.
 */

import * as THREE from 'three';
import { ATLAS_FRAMES } from './atlasData';
import player1SpritesheetImg from '../assets/images/player1_spritesheet.png';

// Registry of real (image-backed) atlas source images.
const ATLAS_SOURCES: Record<string, string> = {
  player1: player1SpritesheetImg,
};

class SpriteAtlasManager {
  private atlasImages: Record<string, HTMLImageElement> = {};
  private loadedSources: Set<string> = new Set();
  private textureCache: Map<string, THREE.CanvasTexture> = new Map();

  constructor() {
    this.loadImages();
  }

  private loadImages() {
    Object.entries(ATLAS_SOURCES).forEach(([key, src]) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        this.atlasImages[key] = img;
        this.loadedSources.add(key);

        // Re-draw any cached canvas textures that belong to this source
        this.textureCache.forEach((texture, frameName) => {
          const frame = ATLAS_FRAMES[frameName];
          if (frame?.source === key) {
            this.updateCanvasTexture(texture, frameName);
          }
        });
      };
    });
  }

  public getTexture(frameName: string): THREE.CanvasTexture {
    if (this.textureCache.has(frameName)) {
      return this.textureCache.get(frameName)!;
    }

    const frame = ATLAS_FRAMES[frameName] || { x: 0, y: 0, width: 64, height: 96 };
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(32, frame.width);
    canvas.height = Math.max(32, frame.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearFilter;

    this.updateCanvasTexture(texture, frameName);
    this.textureCache.set(frameName, texture);

    return texture;
  }

  /** Exposes each frame's true pixel size/aspect so callers can scale
   *  sprites without squashing or stretching them. */
  public getFrameSize(frameName: string): { width: number; height: number } {
    const frame = ATLAS_FRAMES[frameName];
    return frame ? { width: frame.width, height: frame.height } : { width: 64, height: 96 };
  }

  private updateCanvasTexture(texture: THREE.CanvasTexture, frameName: string) {
    const canvas = texture.image as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = ATLAS_FRAMES[frameName] || { x: 0, y: 0, width: 64, height: 96 };
    canvas.width = Math.max(32, frame.width);
    canvas.height = Math.max(32, frame.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sourceKey = frame.source;
    const image = sourceKey ? this.atlasImages[sourceKey] : undefined;

    if (sourceKey && image && this.loadedSources.has(sourceKey)) {
      // Real, verified spritesheet (currently only 'player1' / Nelo).
      ctx.drawImage(
        image,
        frame.x,
        frame.y,
        frame.width,
        frame.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else if (sourceKey && !this.loadedSources.has(sourceKey)) {
      // Real image still loading — leave blank; auto re-drawn on load.
      return;
    } else {
      // 'main' (and anything without a verified image source) always
      // renders procedurally — see file header note above.
      drawFallbackSprite(ctx, frameName, canvas.width, canvas.height);
    }

    texture.needsUpdate = true;
  }
}

/**
 * Clean, dependency-free vector rendering for every non-photographic
 * sprite in the game (lotadores/NPCs/passengers, taxis, map props,
 * UI icons, effects, customization swatches, destination banners, logo).
 */
export function drawFallbackSprite(ctx: CanvasRenderingContext2D, name: string, w: number, h: number) {
  ctx.save();

  if (name.startsWith('player') || name.startsWith('npc') || name.startsWith('passenger')) {
    drawPersonSprite(ctx, name, w, h);
  } else if (name.startsWith('taxi')) {
    drawTaxiSprite(ctx, name, w, h);
  } else if (name.startsWith('object_bus_stop')) {
    drawBusStop(ctx, w, h);
  } else if (name.startsWith('object_stall')) {
    drawMarketStall(ctx, w, h);
  } else if (name.startsWith('object_tree')) {
    drawTree(ctx, w, h);
  } else if (name.startsWith('object_traffic_light')) {
    drawTrafficLight(ctx, w, h);
  } else if (name.startsWith('object_lamp_post')) {
    drawLampPost(ctx, w, h);
  } else if (name.startsWith('object_cone')) {
    drawCone(ctx, w, h);
  } else if (
    name.startsWith('object_container') ||
    name.startsWith('object_crate') ||
    name.startsWith('object_bin') ||
    name.startsWith('object_wall') ||
    name.startsWith('object_barrier')
  ) {
    drawBox(ctx, name, w, h);
  } else if (name.startsWith('effect_coin') || name === 'ui_coin') {
    drawCoin(ctx, w, h);
  } else if (name.startsWith('effect_xp') || name === 'ui_xp') {
    drawXpBadge(ctx, w, h);
  } else if (name.startsWith('effect_')) {
    drawGenericBurst(ctx, w, h);
  } else if (name.startsWith('ui_')) {
    drawUiIcon(ctx, name, w, h);
  } else if (name.startsWith('custom_')) {
    drawCustomSwatch(ctx, name, w, h);
  } else if (name.startsWith('destination_')) {
    drawDestinationBanner(ctx, name, w, h);
  } else if (name.startsWith('logo_')) {
    drawLogo(ctx, w, h);
  } else {
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#161c28';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

function drawPersonSprite(ctx: CanvasRenderingContext2D, name: string, w: number, h: number) {
  const isPlayer = name.startsWith('player');
  const shirtColor = isPlayer
    ? '#ffd700'
    : name.includes('kito')
    ? '#ba1a1a'
    : name.includes('manuel')
    ? '#2e7d32'
    : name.includes('debora')
    ? '#a3277a'
    : name.includes('mestre_ze')
    ? '#7a4a12'
    : name.includes('apressado')
    ? '#fe6b00'
    : name.includes('exigente')
    ? '#ba1a1a'
    : name.includes('indeciso')
    ? '#705d00'
    : name.includes('observador')
    ? '#2e7d32'
    : name.includes('correria')
    ? '#fe6b00'
    : name.includes('especial')
    ? '#a3277a'
    : '#006399';

  let legOffset = 0;
  if (name.includes('_walk_') || name.includes('_run_')) {
    const parts = name.split('_');
    const idx = parseInt(parts[parts.length - 1] || '0', 10);
    const swings = [0, 7, 3, -3, -7, -3, 0, 3];
    legOffset = swings[idx % 8] || 0;
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h - 5, w * 0.35, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#161c28';
  ctx.beginPath();
  ctx.roundRect(w * 0.25 - legOffset * 0.25, h * 0.65, w * 0.2, h * 0.3, 4);
  ctx.roundRect(w * 0.55 + legOffset * 0.25, h * 0.65, w * 0.2, h * 0.3, 4);
  ctx.fill();

  ctx.fillStyle = shirtColor;
  ctx.beginPath();
  ctx.roundRect(w * 0.18, h * 0.32, w * 0.64, h * 0.38, 8);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#161c28';
  ctx.stroke();

  ctx.fillStyle = '#8d5524';
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.22, w * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(w / 2 - 4, h * 0.2, 3.5, 0, Math.PI * 2);
  ctx.arc(w / 2 + 4, h * 0.2, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#161c28';
  ctx.beginPath();
  ctx.arc(w / 2 - 4, h * 0.2, 1.8, 0, Math.PI * 2);
  ctx.arc(w / 2 + 4, h * 0.2, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isPlayer ? '#fe6b00' : '#161c28';
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.16, w * 0.24, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(w * 0.18, h * 0.16, w * 0.64, 4);

  if (name.includes('exigente') || name.includes('especial') || name.includes('correria')) {
    ctx.fillStyle = '#161c28';
    ctx.beginPath();
    ctx.roundRect(w * 0.62, h * 0.42, w * 0.22, h * 0.18, 3);
    ctx.fill();
  }
}

function drawTaxiSprite(ctx: CanvasRenderingContext2D, name: string, w: number, h: number) {
  const bodyColor = name.includes('dourado')
    ? '#ffd700'
    : name.includes('especial')
    ? '#a3277a'
    : name.includes('grande')
    ? '#2e7d32'
    : name.includes('rapido')
    ? '#ba1a1a'
    : '#006399';

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(4, h * 0.18, w - 8, h * 0.62, 10);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#161c28';
  ctx.stroke();

  ctx.fillStyle = '#ffd700';
  ctx.fillRect(4, h * 0.45, w - 8, h * 0.16);

  ctx.fillStyle = '#e2e8f9';
  ctx.beginPath();
  ctx.roundRect(w * 0.12, h * 0.24, w * 0.22, h * 0.18, 3);
  ctx.roundRect(w * 0.39, h * 0.24, w * 0.22, h * 0.18, 3);
  ctx.roundRect(w * 0.66, h * 0.24, w * 0.22, h * 0.18, 3);
  ctx.fill();

  ctx.fillStyle = '#161c28';
  ctx.beginPath();
  ctx.arc(w * 0.25, h * 0.82, 8, 0, Math.PI * 2);
  ctx.arc(w * 0.75, h * 0.82, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawBusStop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#006399';
  ctx.fillRect(w * 0.05, h * 0.1, w * 0.9, h * 0.08);
  ctx.fillStyle = '#161c28';
  ctx.fillRect(w * 0.1, h * 0.18, w * 0.05, h * 0.6);
  ctx.fillRect(w * 0.85, h * 0.18, w * 0.05, h * 0.6);
  ctx.fillStyle = 'rgba(226,232,249,0.6)';
  ctx.fillRect(w * 0.18, h * 0.2, w * 0.64, h * 0.4);
  ctx.strokeStyle = '#161c28';
  ctx.lineWidth = 2;
  ctx.strokeRect(w * 0.18, h * 0.2, w * 0.64, h * 0.4);
  ctx.fillStyle = '#7a4a12';
  ctx.fillRect(w * 0.2, h * 0.65, w * 0.6, h * 0.08);
  ctx.fillRect(w * 0.2, h * 0.65, w * 0.05, h * 0.15);
  ctx.fillRect(w * 0.75, h * 0.65, w * 0.05, h * 0.15);
}

function drawMarketStall(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const stripes = 5;
  const stripeW = w / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#ba1a1a' : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(i * stripeW, h * 0.1);
    ctx.lineTo((i + 1) * stripeW, h * 0.1);
    ctx.lineTo((i + 1) * stripeW - 6, h * 0.32);
    ctx.lineTo(i * stripeW + 6, h * 0.32);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#7a4a12';
  ctx.fillRect(w * 0.1, h * 0.62, w * 0.8, h * 0.12);
  ctx.fillRect(w * 0.14, h * 0.74, w * 0.06, h * 0.2);
  ctx.fillRect(w * 0.8, h * 0.74, w * 0.06, h * 0.2);
  const produceColors = ['#2e7d32', '#fe6b00', '#ffd700'];
  produceColors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(w * (0.25 + i * 0.25), h * 0.55, w * 0.09, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawTree(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#7a4a12';
  ctx.fillRect(w * 0.44, h * 0.55, w * 0.12, h * 0.42);
  ctx.fillStyle = '#2e7d32';
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.38, w * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3f9142';
  ctx.beginPath();
  ctx.arc(w * 0.38, h * 0.28, w * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#161c28';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawTrafficLight(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#161c28';
  ctx.fillRect(w * 0.42, h * 0.25, w * 0.16, h * 0.7);
  ctx.fillRect(w * 0.3, h * 0.05, w * 0.4, h * 0.28);
  const colors = ['#ba1a1a', '#ffd700', '#2e7d32'];
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(w / 2, h * (0.1 + i * 0.09), w * 0.09, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawLampPost(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#161c28';
  ctx.fillRect(w * 0.45, h * 0.15, w * 0.1, h * 0.8);
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.15);
  ctx.lineTo(w * 0.75, h * 0.1);
  ctx.lineTo(w * 0.75, h * 0.18);
  ctx.lineTo(w * 0.5, h * 0.22);
  ctx.fill();
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(w * 0.75, h * 0.14, w * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function drawCone(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#fe6b00';
  ctx.beginPath();
  ctx.moveTo(w / 2, h * 0.08);
  ctx.lineTo(w * 0.85, h * 0.85);
  ctx.lineTo(w * 0.15, h * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#161c28';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w * 0.22, h * 0.55, w * 0.56, h * 0.12);
  ctx.fillStyle = '#161c28';
  ctx.fillRect(w * 0.1, h * 0.85, w * 0.8, h * 0.08);
}

function drawBox(ctx: CanvasRenderingContext2D, name: string, w: number, h: number) {
  const color = name.includes('container')
    ? '#006399'
    : name.includes('crate')
    ? '#7a4a12'
    : name.includes('bin')
    ? '#2e7d32'
    : '#4d4732';
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(w * 0.06, h * 0.1, w * 0.88, h * 0.82, 6);
  ctx.fill();
  ctx.strokeStyle = '#161c28';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.06, h * (0.1 + (i * 0.82) / 3));
    ctx.lineTo(w * 0.94, h * (0.1 + (i * 0.82) / 3));
    ctx.stroke();
  }
}

function drawCoin(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = Math.min(w, h) / 2 - 3;
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a3760a';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#a3760a';
  ctx.font = `bold ${Math.round(r * 0.8)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Kz', w / 2, h / 2 + 1);
}

function drawXpBadge(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#006399';
  const cx = w / 2;
  const cy = h / 2;
  const spikes = 8;
  const outerR = Math.min(w, h) / 2 - 3;
  const innerR = outerR * 0.6;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / spikes;
    const x = cx + r * Math.sin(angle);
    const y = cy - r * Math.cos(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(outerR * 0.55)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('XP', cx, cy + 1);
}

function drawGenericBurst(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = 'rgba(255,215,0,0.85)';
  const cx = w / 2;
  const cy = h / 2;
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const r = Math.min(w, h) * 0.45;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle) * r * 0.5, cy + Math.sin(angle) * r * 0.5, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawUiIcon(ctx: CanvasRenderingContext2D, name: string, w: number, h: number) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, h - 4, 12);
  ctx.fill();
  ctx.strokeStyle = '#161c28';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#161c28';
  ctx.font = `bold ${Math.round(w * 0.45)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const glyphs: Record<string, string> = {
    ui_stamina: '⚡',
    ui_play: '▶',
    ui_confirm: '✓',
    ui_close: '✕',
    ui_settings: '⚙',
    ui_trophy: '🏆',
  };
  ctx.fillText(glyphs[name] || '•', w / 2, h / 2 + 1);
}

function drawCustomSwatch(ctx: CanvasRenderingContext2D, name: string, w: number, h: number) {
  const colorMap: Record<string, string> = {
    custom_cap_red: '#ba1a1a',
    custom_hat_black: '#161c28',
    custom_hat_brown: '#7a4a12',
    custom_hair_1: '#161c28',
    custom_hair_2: '#3a2413',
    custom_hair_3: '#7a4a12',
    custom_shirt_yellow: '#ffd700',
    custom_shirt_red: '#ba1a1a',
    custom_shirt_white: '#f4f4f4',
    custom_pants_blue: '#006399',
    custom_pants_black: '#161c28',
    custom_pants_light: '#a99a6b',
    custom_shoes_red: '#ba1a1a',
    custom_shoes_blue: '#006399',
    custom_shoes_black: '#161c28',
    custom_backpack: '#7a4a12',
    custom_sunglasses: '#161c28',
    custom_megaphone: '#fe6b00',
  };
  ctx.fillStyle = colorMap[name] || '#006399';
  ctx.beginPath();
  ctx.roundRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84, 10);
  ctx.fill();
  ctx.strokeStyle = '#161c28';
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function drawDestinationBanner(ctx: CanvasRenderingContext2D, name: string, w: number, h: number) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, h - 4, h * 0.3);
  ctx.fill();
  ctx.strokeStyle = '#161c28';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  const labels: Record<string, string> = {
    destination_viana: 'VIANA',
    destination_talatona: 'TALATONA',
    destination_centro: 'CENTRO',
  };
  ctx.fillStyle = '#161c28';
  ctx.font = `bold ${Math.round(h * 0.4)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(labels[name] || 'DESTINO', w / 2, h / 2 + 1);
}

function drawLogo(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.roundRect(4, h * 0.2, w - 8, h * 0.5, 16);
  ctx.fill();
  ctx.strokeStyle = '#161c28';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#161c28';
  ctx.font = `bold ${Math.round(w * 0.14)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LOTADOR', w / 2, h * 0.45);
  ctx.font = `bold ${Math.round(w * 0.07)}px sans-serif`;
  ctx.fillText('CORRE · CHAMA · LOTA · GANHA', w / 2, h * 0.75);
}

export const spriteAtlasManager = new SpriteAtlasManager();
