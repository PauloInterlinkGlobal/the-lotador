/**
 * LOTADOR - Sprite Icon Component for UI Modals & Menus
 * Supports both original atlas and CÁÇA player atlas
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

export const SpriteIcon: React.FC<SpriteIconProps> = ({ name, className = '', style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const frame = ATLAS_FRAMES[name] || { x: 0, y: 0, width: 64, height: 96 };
    canvas.width = frame.width;
    canvas.height = frame.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isPlayerFrame =
      name.startsWith('player_front') ||
      name.startsWith('player_back') ||
      name.startsWith('player_left') ||
      name.startsWith('player_right');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = isPlayerFrame ? cacaPlayerAtlasImg : spritesheetImg;
    img.onload = () => {
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
  }, [name]);

  return <canvas ref={canvasRef} className={`inline-block object-contain ${className}`} style={style} />;
};
