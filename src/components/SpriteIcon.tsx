/**
 * LOTADOR - Sprite Icon Component for UI Modals & Menus
 * Supports both original atlas and CÁÇA player atlas with image sharing & caching
 */

import React, { useEffect, useRef } from 'react';
import { ATLAS_FRAMES } from '../utils/atlasData';
import spritesheetImg from '../assets/images/lotador_spritesheet_1786361082992.png';
import cacaPlayerAtlasImg from '../assets/images/caca_player_atlas.png';

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

    const isPlayerFrame =
      name.startsWith('player_front') ||
      name.startsWith('player_back') ||
      name.startsWith('player_left') ||
      name.startsWith('player_right');

    const src = isPlayerFrame ? cacaPlayerAtlasImg : spritesheetImg;

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
