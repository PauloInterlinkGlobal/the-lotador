/**
 * LOTADOR — Banner Inicial da Fase ("Nível N — Objetivos")
 * Exibido brevemente no início de cada partida (3.5 segundos)
 * informando a rota e os objetivos que o jogador tem de cumprir.
 */

import React, { useState, useEffect } from 'react';
import { LevelObjective } from '../types/levelObjectives';

interface LevelStartBannerProps {
  levelNumber: number;
  route: string;
  title: string;
  objectives: LevelObjective[];
  onDismiss?: () => void;
}

export const LevelStartBanner: React.FC<LevelStartBannerProps> = ({
  levelNumber,
  route,
  title,
  objectives,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 3800);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div
      onClick={() => {
        setVisible(false);
        onDismiss?.();
      }}
      className="absolute top-[clamp(44px,9vh,64px)] left-1/2 -translate-x-1/2 z-40 max-w-md w-[90vw] pointer-events-auto cursor-pointer animate-in fade-in slide-in-from-top-4 duration-300 select-none"
    >
      <div className="bg-[#161c28]/95 backdrop-blur-md border-2 border-[#ffd700] rounded-2xl p-3 shadow-2xl text-center flex flex-col items-center gap-1.5 text-white">
        {/* Badge do Nível e Rota */}
        <div className="flex items-center gap-2">
          <span className="bg-[#ffd700] text-[#161c28] font-space font-black text-[10px] md:text-[11px] uppercase px-3 py-0.5 rounded-full border border-[#161c28] tracking-wider">
            FASE {levelNumber} • LINHA {route.toUpperCase()}
          </span>
        </div>

        {/* Título da Fase */}
        <h3 className="font-anybody font-black text-sm md:text-base text-white uppercase tracking-wide">
          {title}
        </h3>

        {/* Lista de Objetivos */}
        <div className="w-full flex flex-col gap-1 bg-white/5 border border-white/10 rounded-xl p-2 text-left">
          {objectives.map((obj, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] font-space">
              <span className="text-[#ffd700] text-xs">🎯</span>
              <span className="text-slate-200 font-semibold">{obj.description}</span>
            </div>
          ))}
        </div>

        <span className="text-[9px] font-space text-slate-400 uppercase tracking-widest mt-0.5">
          Toca para fechar
        </span>
      </div>
    </div>
  );
};
