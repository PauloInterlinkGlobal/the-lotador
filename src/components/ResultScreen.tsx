/**
 * LOTADOR Match Result Screen
 * Displays stage results, star ratings, XP & level-up animations,
 * station mastery (Paragem Dominada), and seamless phase transitions.
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MatchResults } from '../types/game';
import { soundManager } from '../utils/audio';
import { getLevelTitle, getPlayerTier } from '../utils/storage';

interface ResultScreenProps {
  results: MatchResults;
  onPlayAgain: () => void;
  onContinue: () => void;
  onNextLevel?: () => void;
  onOpenLevelMap?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  results,
  onPlayAgain,
  onContinue,
  onNextLevel,
  onOpenLevelMap,
}) => {
  const isVictory = results.isVictory !== false;
  const stars = results.starsEarned || (isVictory ? 1 : 0);
  const isParagemDominada = results.isParagemDominada || stars === 3;

  useEffect(() => {
    if (isVictory) {
      // Launch festive confetti for victory
      confetti({
        particleCount: isParagemDominada ? 120 : 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#fe6b00', '#006399', '#ffffff', '#2e7d32'],
      });
      soundManager.playTaxiFull();
      if (results.levelUp) {
        soundManager.playLevelUp();
      }
    } else {
      soundManager.playDisputeLose();
    }
  }, [isVictory, isParagemDominada, results.levelUp]);

  const newTier = results.newLevel ? getPlayerTier(results.newLevel) : null;
  const newTitle = results.newLevel ? getLevelTitle(results.newLevel) : null;

  return (
    <div className="relative w-full h-screen bg-[#241a15]/90 backdrop-blur-xs flex flex-col items-center justify-center p-3 md:p-4 select-none overflow-hidden font-work z-50">
      {/* Container Card */}
      <div className="bg-white sticker-border hard-shadow-lg p-5 md:p-6 rounded-3xl max-w-md w-full text-center flex flex-col items-center max-h-[95vh] overflow-y-auto">
        
        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          {results.levelNumber && (
            <span className="bg-[#161c28] text-[#ffd700] text-[11px] font-space font-bold px-3 py-1 rounded-full border border-[#161c28]">
              FASE {results.levelNumber} • {results.zoneName || 'LUANDA'}
            </span>
          )}
          {results.isTutorial && (
            <span className="bg-[#006399] text-white text-[11px] font-space font-bold px-3 py-1 rounded-full border border-[#161c28]">
              MODO APRENDIZ
            </span>
          )}
        </div>

        {/* Banner Title */}
        <div
          className={`sticker-border hard-shadow px-6 py-2 rounded-2xl mb-3 w-full ${
            !isVictory
              ? 'bg-[#ba1a1a] text-white'
              : isParagemDominada
              ? 'bg-[#ffd700] text-[#161c28]'
              : 'bg-[#fe6b00] text-white'
          }`}
        >
          <h2 className="font-anybody font-black text-xl md:text-2xl uppercase tracking-wider flex items-center justify-center gap-2">
            {!isVictory ? (
              <>⏱️ TEMPO ESGOTADO</>
            ) : isParagemDominada ? (
              <>👑 PARAGEM DOMINADA!</>
            ) : (
              <>🏆 VITÓRIA NA FASE!</>
            )}
          </h2>
          {results.levelTitle && (
            <p className="text-xs font-space font-semibold mt-0.5 opacity-90">
              {results.levelTitle}
            </p>
          )}
        </div>

        {/* Stars Display (1 to 3 Stars) */}
        {isVictory && (
          <div className="flex flex-col items-center mb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              {[1, 2, 3].map((starNum) => {
                const earned = starNum <= stars;
                return (
                  <div
                    key={starNum}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-[#161c28] flex items-center justify-center text-2xl md:text-3xl transition-transform ${
                      earned
                        ? 'bg-[#ffd700] text-[#161c28] hard-shadow-sm scale-105'
                        : 'bg-slate-100 text-slate-300 opacity-60'
                    }`}
                  >
                    ★
                  </div>
                );
              })}
            </div>
            <span className="font-space text-xs font-bold text-slate-600">
              {stars === 3
                ? '⭐ Perfeito! 3 Estrelas conquistadas'
                : stars === 2
                ? '⭐ Muito bom! 2 Estrelas conquistadas'
                : '⭐ Fase superada! 1 Estrela conquistada'}
            </span>
          </div>
        )}

        {/* Defeat Explanatory Card */}
        {!isVictory && (
          <div className="w-full bg-[#ffdad6] border-2 border-[#ba1a1a] rounded-2xl p-3 mb-3 text-left">
            <p className="font-space font-bold text-xs text-[#ba1a1a] mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">error</span>
              OBJETIVO NÃO CUMPRIDO
            </p>
            <p className="font-work text-xs text-[#410002] leading-relaxed">
              {results.failReason || 'Não conseguiste completar todos os requisitos da fase antes do tempo terminar.'}
            </p>
            <p className="font-work text-[11px] text-[#93000a] mt-1.5 font-medium">
              💡 Dica: Usa o botão Chamar [E] para atrair passageiros e corre [Shift] para poupar tempo.
            </p>
          </div>
        )}

        {/* Level Up Notification Banner */}
        {results.levelUp && (
          <div className="w-full bg-gradient-to-r from-[#fe6b00] to-[#ffd700] text-[#161c28] p-3 rounded-2xl border-2 border-[#161c28] mb-3 flex items-center justify-between hard-shadow-sm animate-bounce">
            <div className="text-left">
              <span className="text-[10px] font-space font-black uppercase tracking-wider block text-white bg-[#161c28] px-2 py-0.5 rounded w-max mb-0.5">
                🎉 SUBISTE DE NÍVEL!
              </span>
              <h4 className="font-anybody font-black text-sm text-[#161c28]">
                NÍVEL {results.oldLevel} ➔ NÍVEL {results.newLevel}
              </h4>
              {newTitle && (
                <p className="text-[11px] font-space font-bold text-[#161c28]">
                  Título: {newTitle}
                </p>
              )}
            </div>
            {newTier && (
              <span className="text-xs bg-[#161c28] text-[#ffd700] px-2.5 py-1.5 rounded-xl font-space font-black border border-[#161c28]">
                {newTier.badge}
              </span>
            )}
          </div>
        )}

        {/* Record Badge */}
        {results.isNewRecord && (
          <div className="bg-[#fe6b00] text-white font-space font-bold text-xs uppercase px-3 py-1 rounded-full mb-3 border border-[#161c28] rush-pulse">
            🔥 NOVO RECORDE DE Kz!
          </div>
        )}

        {/* Match Statistics Card */}
        <div className="w-full bg-[#f1f3ff] rounded-2xl p-3.5 border-2 border-[#161c28] mb-4 flex flex-col gap-2">
          <div className="flex justify-between items-center font-space text-xs md:text-sm">
            <span className="text-slate-600 font-medium">Táxis Despachados:</span>
            <span className="font-bold text-[#161c28]">{results.taxisLoaded} 🚐</span>
          </div>

          <div className="flex justify-between items-center font-space text-xs md:text-sm">
            <span className="text-slate-600 font-medium">Passageiros Atendidos:</span>
            <span className="font-bold text-[#161c28]">{results.passengersServed} 👤</span>
          </div>

          <div className="flex justify-between items-center font-space text-xs md:text-sm">
            <span className="text-slate-600 font-medium">Combo Máximo:</span>
            <span className="font-bold text-[#fe6b00]">x{results.maxCombo} 🔥</span>
          </div>

          <hr className="border-slate-300 my-0.5" />

          {/* Earnings & XP */}
          <div className="flex justify-between items-center font-space text-xs md:text-sm">
            <span className="text-slate-700 font-bold">Faturamento (Kz):</span>
            <span className="font-space font-bold text-base text-[#006399]">
              +{results.earnedMoney.toLocaleString()} Kz
            </span>
          </div>

          <div className="flex justify-between items-center font-space text-xs md:text-sm">
            <span className="text-slate-700 font-bold">Experiência (XP):</span>
            <span className="font-space font-bold text-sm text-[#705e00]">
              +{results.earnedXp} XP
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Primary Action Button */}
          {isVictory && onNextLevel && (
            <button
              onClick={() => {
                soundManager.playClick();
                onNextLevel();
              }}
              className="w-full bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black py-3 rounded-2xl sticker-border hard-shadow btn-press uppercase text-sm md:text-base flex items-center justify-center gap-2"
            >
              <span>PRÓXIMA FASE</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          )}

          {/* Retry Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className={`w-full font-anybody font-black py-3 rounded-2xl sticker-border hard-shadow btn-press uppercase text-sm md:text-base ${
              !isVictory
                ? 'bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28]'
                : 'bg-white hover:bg-slate-50 text-[#161c28]'
            }`}
          >
            {!isVictory ? 'TENTAR NOVAMENTE' : 'REPETIR FASE'}
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            {onOpenLevelMap && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenLevelMap();
                }}
                className="bg-[#e0e2ec] hover:bg-[#d0d3de] text-[#161c28] font-space font-bold py-2.5 rounded-2xl border-2 border-[#161c28] uppercase text-xs btn-press flex items-center justify-center gap-1"
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
              className={`bg-white hover:bg-slate-100 text-[#161c28] font-space font-bold py-2.5 rounded-2xl border-2 border-[#161c28] uppercase text-xs btn-press flex items-center justify-center gap-1 ${
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
