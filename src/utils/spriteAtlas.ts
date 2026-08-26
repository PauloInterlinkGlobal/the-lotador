/**
 * LOTADOR - Sprite Atlas Slicer & Texture Manager
 */

import * as THREE from 'three';
import { ATLAS_FRAMES } from './atlasData';
import spritesheetImg from '../assets/images/lotador_spritesheet_1786361082992.jpg';

class SpriteAtlasManager {
  private atlasImage: HTMLImageElement | null = null;
  private textureCache: Map<string, THREE.CanvasTexture> = new Map();
  private loaded = false;

  constructor() {
    this.loadImage();
  }

  private loadImage() {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = spritesheetImg;
    img.onload = () => {
      this.atlasImage = img;
      this.loaded = true;

      // Re-draw all cached canvas textures once real image is loaded
      this.textureCache.forEach((texture, frameName) => {
        this.updateCanvasTexture(texture, frameName);
      });
    };
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

  private updateCanvasTexture(texture: THREE.CanvasTexture, frameName: string) {
    const canvas = texture.image as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = ATLAS_FRAMES[frameName] || { x: 0, y: 0, width: 64, height: 96 };
    canvas.width = Math.max(32, frame.width);
    canvas.height = Math.max(32, frame.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.atlasImage && this.loaded) {
      ctx.drawImage(
        this.atlasImage,
        frame.x,
        frame.y,
        frame.width,
        frame.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else {
      this.drawFallbackSprite(ctx, frameName, canvas.width, canvas.height);
    }

    texture.needsUpdate = true;
  }

  private drawFallbackSprite(ctx: CanvasRenderingContext2D, name: string, w: number, h: number) {
    ctx.save();

    if (name.startsWith('player') || name.startsWith('npc') || name.startsWith('passenger')) {
      const isPlayer = name.startsWith('player');
      const shirtColor = isPlayer
        ? '#ffd700'
        : name.includes('kito')
        ? '#ba1a1a'
        : name.includes('manuel')
        ? '#2e7d32'
        : name.includes('apressado')
        ? '#fe6b00'
        : '#006399';

      // Calculate leg swing offset based on frame
      let legOffset = 0;
      if (name.includes('_walk_')) {
        const idx = parseInt(name.split('_walk_')[1] || '0', 10);
        const swings = [0, 5, 0, -5];
        legOffset = swings[idx % 4] || 0;
      } else if (name.includes('_run_')) {
        const idx = parseInt(name.split('_run_')[1] || '0', 10);
        const swings = [0, 7, 3, -3, -7, -3, 0, 3];
        legOffset = swings[idx % 8] || 0;
      }

      // Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(w / 2, h - 5, w * 0.35, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs (with leg swing)
      ctx.fillStyle = '#161c28';
      ctx.beginPath();
      ctx.roundRect(w * 0.25 - legOffset * 0.25, h * 0.65, w * 0.2, h * 0.3, 4);
      ctx.roundRect(w * 0.55 + legOffset * 0.25, h * 0.65, w * 0.2, h * 0.3, 4);
      ctx.fill();

      // Shirt / Torso
      ctx.fillStyle = shirtColor;
      ctx.beginPath();
      ctx.roundRect(w * 0.18, h * 0.32, w * 0.64, h * 0.38, 8);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#161c28';
      ctx.stroke();

      // Head
      ctx.fillStyle = '#8d5524';
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.22, w * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eyes
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

      // Cap
      ctx.fillStyle = isPlayer ? '#fe6b00' : '#161c28';
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.16, w * 0.24, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(w * 0.18, h * 0.16, w * 0.64, 4);
    } else if (name.startsWith('taxi')) {
      // Taxi Van
      ctx.fillStyle = '#006399'; // Blue Kandongueiro
      ctx.beginPath();
      ctx.roundRect(4, h * 0.18, w - 8, h * 0.62, 10);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#161c28';
      ctx.stroke();

      // Yellow Stripe
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(4, h * 0.45, w - 8, h * 0.16);

      // Windows
      ctx.fillStyle = '#e2e8f9';
      ctx.beginPath();
      ctx.roundRect(w * 0.12, h * 0.24, w * 0.22, h * 0.18, 3);
      ctx.roundRect(w * 0.39, h * 0.24, w * 0.22, h * 0.18, 3);
      ctx.roundRect(w * 0.66, h * 0.24, w * 0.22, h * 0.18, 3);
      ctx.fill();

      // Wheels
      ctx.fillStyle = '#161c28';
      ctx.beginPath();
      ctx.arc(w * 0.25, h * 0.82, 8, 0, Math.PI * 2);
      ctx.arc(w * 0.75, h * 0.82, 8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Object / Tree / Sign
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
}

export const spriteAtlasManager = new SpriteAtlasManager();
