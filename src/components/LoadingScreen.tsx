/**
 * LOTADOR - Match Asset Loading Screen
 * Preloads 3D models, textures, and sprite atlases before entering active gameplay.
 */

import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  progress: number; // 0 to 100
}

const LOADING_HINTS = [
  'A preparar a paragem e a afinar o asfalto...',
  'A abastecer os Candongueiros com gasosa...',
  'A afinar a buzina do Toyota HiAce...',
  'Passageiros a juntar as notas de Kwanza...',
  'Fiscais a conferir a rota Viana - Mutamba...',
  'Zungueiras a arrumar os cestos na calçada...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  const [hintIndex, setHintIndex] = useState(() => Math.floor(Math.random() * LOADING_HINTS.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % LOADING_HINTS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="absolute inset-0 z-50 bg-[#0a192f] text-white flex flex-col items-center justify-between p-6 select-none overflow-hidden animate-fade-in">
      {/* Background Decorative Radial Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,99,153,0.18)_0%,transparent_70%)]" />

      {/* Top Brand Tag */}
      <div className="relative z-10 pt-4 flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400/80 uppercase">
          Luanda Taxi Craze
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            A carregar motor 3D
          </span>
        </div>
      </div>

      {/* Centerpiece: Candongueiro Graphic & Progress Gauge */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-4">
        {/* Animated Candongueiro Van Icon */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-[#006dae] to-[#004f80] border-2 border-amber-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,109,174,0.4)]">
            <span className="material-symbols-outlined text-5xl text-amber-300 animate-bounce">
              airport_shuttle
            </span>
          </div>
          {/* Subtle headlight beams */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-16 h-8 bg-gradient-to-l from-yellow-300/30 to-transparent blur-xs pointer-events-none rounded-full" />
        </div>

        {/* Title */}
        <h2 className="font-anybody font-black text-3xl tracking-wider text-white uppercase text-center mb-1">
          LOTADOR
        </h2>
        <p className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-6">
          CORRE · CHAMA · LOTA · GANHA
        </p>

        {/* Dynamic Hint */}
        <div className="h-7 flex items-center justify-center mb-3">
          <p className="text-xs sm:text-sm text-slate-300 font-medium text-center italic transition-all duration-300">
            "{LOADING_HINTS[hintIndex]}"
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900/90 rounded-full h-4 p-0.5 border border-amber-500/30 shadow-inner overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 transition-all duration-200 ease-out shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        {/* Percentage Label */}
        <div className="w-full flex justify-between items-center text-xs font-bold font-mono">
          <span className="text-slate-400 tracking-wider">PREPARAÇÃO</span>
          <span className="text-amber-400 text-sm">{clampedProgress}%</span>
        </div>
      </div>

      {/* Footer Route Badges */}
      <div className="relative z-10 pb-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700">VIANA</span>
          <span className="text-amber-400">✦</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700">TALATONA</span>
          <span className="text-amber-400">✦</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700">MUTAMBA</span>
          <span className="text-amber-400">✦</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700">SÃO PAULO</span>
        </div>
      </div>
    </div>
  );
};
