/**
 * LOTADOR Pause Modal
 * Compact pause menu when the user presses [Ⅱ] or [Esc] during gameplay
 */

import React from 'react';
import { soundManager } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onOpenObjectives: () => void;
  onOpenSettings: () => void;
  onQuitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onOpenObjectives,
  onOpenSettings,
  onQuitToMenu,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white sticker-border hard-shadow-lg p-5 rounded-3xl max-w-xs w-full flex flex-col items-center animate-scale-in text-center">
        {/* Header */}
        <div className="w-10 h-10 rounded-full bg-[#161c28] flex items-center justify-center text-white mb-2 shadow-sm">
          <span className="font-bold text-sm tracking-tighter">Ⅱ</span>
        </div>
        <h2 className="font-anybody font-black text-xl text-[#161c28] uppercase tracking-wide mb-1">
          TURNO EM PAUSA
        </h2>
        <p className="text-xs text-slate-500 font-bold mb-4">
          O relógio e a paragem estão parados.
        </p>

        {/* Buttons List */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Resume */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onResume();
            }}
            className="w-full py-2.5 bg-[#ffd700] hover:bg-[#ffe066] active:scale-95 text-[#161c28] font-anybody font-black text-sm uppercase rounded-xl sticker-border hard-shadow flex items-center justify-center gap-2 cursor-pointer transition-transform"
          >
            <span>▶ CONTINUAR</span>
          </button>

          {/* Objectives */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenObjectives();
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-[#161c28] font-space font-bold text-xs uppercase rounded-xl border-2 border-[#161c28] flex items-center justify-center gap-1.5 cursor-pointer transition-transform"
          >
            <span>🎯 OBJETIVOS DO DIA</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-[#161c28] font-space font-bold text-xs uppercase rounded-xl border-2 border-[#161c28] flex items-center justify-center gap-1.5 cursor-pointer transition-transform"
          >
            <span>⚙️ DEFINIÇÕES</span>
          </button>

          {/* Quit */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onQuitToMenu();
            }}
            className="w-full py-2 bg-red-50 hover:bg-red-100 active:scale-95 text-[#ba1a1a] font-space font-bold text-xs uppercase rounded-xl border-2 border-[#ba1a1a] flex items-center justify-center gap-1.5 cursor-pointer transition-transform mt-1"
          >
            <span>✕ SAIR PARA O MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
