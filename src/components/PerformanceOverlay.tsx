import React, { useState, useEffect } from 'react';
import { GameEngine } from '../game/GameEngine';

interface PerformanceOverlayProps {
  engine: GameEngine | null;
  onQualityChange?: (quality: 'LOW' | 'MEDIUM' | 'HIGH') => void;
}

export const PerformanceOverlay: React.FC<PerformanceOverlayProps> = ({
  engine,
  onQualityChange,
}) => {
  const [diagnostics, setDiagnostics] = useState<{
    fps: number;
    drawCalls: number;
    triangles: number;
    geometries: number;
    textures: number;
    quality: 'LOW' | 'MEDIUM' | 'HIGH';
    entities: { passengers: number; taxis: number; particles: number };
  } | null>(null);

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!engine) return;

    const interval = setInterval(() => {
      if (engine && typeof (engine as any).getDiagnostics === 'function') {
        setDiagnostics((engine as any).getDiagnostics());
      }
    }, 250);

    return () => clearInterval(interval);
  }, [engine]);

  if (!diagnostics) return null;

  const fps = diagnostics.fps;
  const fpsColor =
    fps >= 48 ? 'bg-emerald-500 text-white' : fps >= 28 ? 'bg-amber-500 text-black' : 'bg-red-600 text-white';

  const cycleQuality = () => {
    const nextQuality =
      diagnostics.quality === 'LOW'
        ? 'MEDIUM'
        : diagnostics.quality === 'MEDIUM'
        ? 'HIGH'
        : 'LOW';
    if (engine) {
      engine.setGraphicsQuality(nextQuality);
    }
    if (onQualityChange) {
      onQualityChange(nextQuality);
    }
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed top-2 left-2 z-[9999] px-2 py-0.5 rounded-lg bg-black/80 text-white font-mono text-[10px] border border-white/20 shadow-md backdrop-blur-xs flex items-center gap-1.5"
      >
        <span className={`px-1.5 py-0.2 rounded font-bold ${fpsColor}`}>{fps} FPS</span>
        <span className="text-slate-300 font-bold">OPT</span>
      </button>
    );
  }

  return (
    <div className="fixed top-2 left-2 z-[9999] bg-slate-900/90 text-white rounded-xl border border-slate-700/80 shadow-xl backdrop-blur-sm p-2 text-xs font-mono select-none flex flex-col gap-1.5 max-w-[210px]">
      <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1">
        <span className="font-bold text-[10px] text-slate-300 tracking-wider">DIAGNÓSTICO 3D</span>
        <div className="flex items-center gap-1">
          <button
            onClick={cycleQuality}
            title="Clique para alternar qualidade gráfica"
            className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 active:scale-95 text-[10px] font-bold text-white uppercase transition-transform"
          >
            {diagnostics.quality}
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-4 h-4 rounded flex items-center justify-center text-slate-400 hover:text-white text-[10px]"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-[11px]">FPS:</span>
        <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${fpsColor}`}>
          {fps} FPS
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-300 pt-0.5">
        <div className="flex justify-between">
          <span className="text-slate-400">Draw Calls:</span>
          <span className="font-bold text-amber-300">{diagnostics.drawCalls}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Triângulos:</span>
          <span className="font-bold text-sky-300">
            {diagnostics.triangles > 1000
              ? `${(diagnostics.triangles / 1000).toFixed(1)}k`
              : diagnostics.triangles}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Texturas:</span>
          <span className="font-semibold text-slate-200">{diagnostics.textures}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Geometrias:</span>
          <span className="font-semibold text-slate-200">{diagnostics.geometries}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-700/60 pt-1">
        <span>Pax: {diagnostics.entities.passengers}</span>
        <span>Táxis: {diagnostics.entities.taxis}</span>
        <span>Part: {diagnostics.entities.particles}</span>
      </div>
    </div>
  );
};
