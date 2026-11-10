/**
 * LOTADOR - Sprite Icon Component for UI Modals & Menus
 * Supports both original atlas and CÁÇA player atlas with image sharing & caching
 */

import React, { useEffect, useRef } from 'react';
import { ATLAS_FRAMES } from '../utils/atlasData';
import spritesheetImg from '../assets/images/lotador_spritesheet_1786361082992.webp';
import player1SpritesheetImg from '../assets/images/player1_spritesheet.png';

import { drawFallbackSprite } from '../utils/spriteAtlas';

interface SpriteIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

// Module-level shared image cache so spritesheet is decoded once across the entire application
const imageCache: Record<string, HTMLImageElement> = {};
const listeners: Record<string, Array<() => void>> = {};

function getSharedImage(src: string, onReady: () => void): HTMLImageElement {
  if (imageCache[src] && imageCache[src].complete) {
    onReady();
    return imageCache[src];
  }

  if (!imageCache[src]) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    imageCache[src] = img;
    listeners[src] = [];

    img.onload = () => {
      const callbacks = listeners[src] || [];
      callbacks.forEach((cb) => cb());
      delete listeners[src];
    };
  }

  if (listeners[src]) {
    listeners[src].push(onReady);
  }

  return imageCache[src];
}

export const SpriteIcon: React.FC<SpriteIconProps> = ({ name, className = '', style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const frame = ATLAS_FRAMES[name] || { x: 0, y: 0, width: 64, height: 96 };
    canvas.width = frame.width;
    canvas.height = frame.height;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    // For passenger sprites, obstacles, effects and UI icons, use vector fallback renderer for 100% crispness
    if (name.startsWith('passenger_') || name.startsWith('obstacle_') || name.startsWith('effect_') || name.startsWith('ui_')) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFallbackSprite(ctx, name, canvas.width, canvas.height);
      return;
    }

    const isPlayerFrame =
      name.startsWith('player_front') ||
      name.startsWith('player_back') ||
      name.startsWith('player_left') ||
      name.startsWith('player_right');

    const src = isPlayerFrame ? player1SpritesheetImg : spritesheetImg;

    const draw = () => {
      const img = imageCache[src];
      if (!img || !img.complete || !canvasRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        frame.x,
        frame.y,
        frame.width,
        frame.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };

    const img = getSharedImage(src, draw);
    if (img.complete) {
      draw();
    }
  }, [name]);

  return <canvas ref={canvasRef} className={`inline-block object-contain ${className}`} style={style} />;
};
