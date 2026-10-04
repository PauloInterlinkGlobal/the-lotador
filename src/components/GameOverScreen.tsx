/**
 * LOTADOR — Tela de Fim de Jogo / Derrota (GameOverScreen)
 * Apresentação quando o turno expira sem cumprimento dos objetivos
 */

import React, { useEffect } from 'react';
import { MatchResults } from '../types/game';
import { soundManager } from '../utils/audio';

interface GameOverScreenProps {
  results: MatchResults;
  onRetry: () => void;
  onContinue: () => void;
  onOpenLevelMap?: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  results,
  onRetry,
  onContinue,
  onOpenLevelMap,
}) => {
  useEffect(() => {
    soundManager.playDisputeLose();
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#241a15]/95 backdrop-blur-xs flex flex-col items-center justify-center p-3 md:p-4 select-none overflow-hidden font-work z-50">
      <div className="bg-white sticker-border hard-shadow-lg p-5 md:p-6 rounded-3xl max-w-md w-full text-center flex flex-col items-center max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          {results.levelNumber && (
            <span className="bg-[#ba1a1a] text-white text-[11px] font-space font-bold px-3 py-1 rounded-full border border-[#161c28]">
              FASE {results.levelNumber} • {results.zoneName || 'LUANDA'}
            </span>
          )}
        </div>

        {/* Defeat Banner */}
        <div className="bg-[#ba1a1a] text-white sticker-border hard-shadow px-6 py-2.5 rounded-2xl mb-3 w-full">
          <h2 className="font-anybody font-black text-xl md:text-2xl uppercase tracking-wider flex items-center justify-center gap-2">
            ⏱️ TEMPO ESGOTADO!
          </h2>
          {results.levelTitle && (
            <p className="text-xs font-space font-semibold mt-0.5 opacity-90">
              {results.levelTitle}
            </p>
          )}
        </div>

        {/* Failure Reason Card */}
        <div className="w-full bg-[#ffdad6] border-2 border-[#ba1a1a] rounded-2xl p-3.5 mb-3 text-left">
          <p className="font-space font-bold text-xs text-[#ba1a1a] mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">error</span>
            <span>OBJETIVO DA PARAGEM NÃO ATINGIDO</span>
          </p>
          <p className="font-work text-xs text-[#410002] leading-relaxed">
            {results.failReason || 'O cronómetro de turno chegou a zero antes de lotares as carrinhas solicitadas para esta rota.'}
          </p>
          <div className="mt-2.5 pt-2 border-t border-[#ba1a1a]/20">
            <p className="font-work text-[11px] text-[#93000a] font-medium leading-snug">
              💡 <strong>Conselho do Manuel Veterano:</strong> Usa o botão <strong>CHAMAR [E]</strong> perto de grupos de clientes e corre com <strong>[SHIFT]</strong> para não perderes passageiros para os concorrentes!
            </p>
          </div>
        </div>

        {/* Match Statistics Card (Retention: player keeps earnings) */}
        <div className="w-full bg-[#f1f3ff] rounded-2xl p-3.5 border-2 border-[#161c28] mb-4 flex flex-col gap-2">
          <div className="text-left font-space text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
            Produção no Turno
          </div>

          <div className="flex justify-between items-center font-space text-xs md:text-sm">
            <span className="text-slate-600 font-medium">Passageiros Transportados:</span>
            <span className="font-bold text-[#161c28]">{results.passengersServed} 👤</span>
          </div>

          <div className="flex justify-between items-center font-space text-xs md:text-sm">
            <span className="text-slate-600 font-medium">Táxis Lotados:</span>
            <span className="font-bold text-[#161c28]">{results.taxisLoaded} 🚐</span>
          </div>

          <hr className="border-slate-300 my-0.5" />

          <div className="flex justify-between items-center font-space text-xs md:text-sm">
            <span className="text-slate-700 font-bold">Gorjetas Arrecadadas:</span>
            <span className="font-space font-bold text-base text-[#006399]">
              +{results.earnedMoney.toLocaleString()} Kz
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Primary Action Button (Retry) */}
          <button
            onClick={() => {
              soundManager.playClick();
              onRetry();
            }}
            className="w-full bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black py-3 rounded-2xl sticker-border hard-shadow btn-press uppercase text-sm md:text-base flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
          >
            <span className="material-symbols-outlined text-lg">replay</span>
            <span>TENTAR NOVAMENTE</span>
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            {onOpenLevelMap && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenLevelMap();
                }}
                className="bg-[#e0e2ec] hover:bg-[#d0d3de] text-[#161c28] font-space font-bold py-2.5 rounded-2xl border-2 border-[#161c28] uppercase text-xs btn-press flex items-center justify-center gap-1 cursor-pointer touch-manipulation"
              >
                <span className="material-symbols-outlined text-sm">map</span>
                FASES
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playClick();
                onContinue();
              }}
              className={`bg-white hover:bg-slate-100 text-[#161c28] font-space font-bold py-2.5 rounded-2xl border-2 border-[#161c28] uppercase text-xs btn-press flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
                !onOpenLevelMap ? 'col-span-2' : ''
              }`}
            >
              <span className="material-symbols-outlined text-sm">home</span>
              MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
