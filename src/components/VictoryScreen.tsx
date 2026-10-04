/**
 * LOTADOR — Tela de Vitória (VictoryScreen)
 * Apresentação comemorativa ao vencer uma fase da carreira de lotador
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MatchResults } from '../types/game';
import { soundManager } from '../utils/audio';
import { getLevelTitle, getPlayerTier } from '../utils/storage';

interface VictoryScreenProps {
  results: MatchResults;
  onNextLevel?: () => void;
  onPlayAgain: () => void;
  onContinue: () => void;
  onOpenLevelMap?: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  results,
  onNextLevel,
  onPlayAgain,
  onContinue,
  onOpenLevelMap,
}) => {
  const stars = results.starsEarned || 1;
  const isParagemDominada = results.isParagemDominada || stars === 3;

  useEffect(() => {
    confetti({
      particleCount: isParagemDominada ? 120 : 80,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#fe6b00', '#006399', '#ffffff', '#2e7d32'],
    });
    soundManager.playTaxiFull();
    if (results.levelUp) {
      soundManager.playLevelUp();
    }
  }, [isParagemDominada, results.levelUp]);

  const newTier = results.newLevel ? getPlayerTier(results.newLevel) : null;
  const newTitle = results.newLevel ? getLevelTitle(results.newLevel) : null;

  return (
    <div className="relative w-full h-screen bg-[#241a15]/90 backdrop-blur-xs flex flex-col items-center justify-center p-3 md:p-4 select-none overflow-hidden font-work z-50">
      <div className="bg-white sticker-border hard-shadow-lg p-5 md:p-6 rounded-3xl max-w-md w-full text-center flex flex-col items-center max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          {results.levelNumber && (
            <span className="bg-[#161c28] text-[#ffd700] text-[11px] font-space font-bold px-3 py-1 rounded-full border border-[#161c28]">
              FASE {results.levelNumber} • {results.zoneName || 'LUANDA'}
            </span>
          )}
          {results.isTutorial && (
            <span className="bg-[#006399] text-white text-[11px] font-space font-bold px-3 py-1 rounded-full border border-[#161c28]">
              TREINO CONCLUÍDO
            </span>
          )}
        </div>

        {/* Victory Title Banner */}
        <div
          className={`sticker-border hard-shadow px-6 py-2.5 rounded-2xl mb-3 w-full ${
            isParagemDominada ? 'bg-[#ffd700] text-[#161c28]' : 'bg-[#fe6b00] text-white'
          }`}
        >
          <h2 className="font-anybody font-black text-xl md:text-2xl uppercase tracking-wider flex items-center justify-center gap-2">
            {isParagemDominada ? (
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

        {/* Star Rating Section */}
        <div className="flex flex-col items-center mb-3 w-full">
          <div className="flex items-center justify-center gap-2 mb-1">
            {[1, 2, 3].map((starNum) => {
              const earned = starNum <= stars;
              return (
                <div
                  key={starNum}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-[#161c28] flex items-center justify-center text-2xl md:text-3xl transition-transform ${
                    earned
                      ? 'bg-[#ffd700] text-[#161c28] hard-shadow-sm scale-105 animate-bounce'
                      : 'bg-slate-100 text-slate-300 opacity-60'
                  }`}
                  style={{ animationDelay: `${starNum * 120}ms` }}
                >
                  ★
                </div>
              );
            })}
          </div>

          <span className="font-space text-xs font-bold text-slate-600 mb-2">
            {stars === 3
              ? '⭐ Perfeito! 3 Estrelas conquistadas'
              : stars === 2
              ? '⭐ Muito bom! 2 Estrelas conquistadas'
              : '⭐ Fase superada! 1 Estrela conquistada'}
          </span>

          {/* Star Conditions Detailed Checklist */}
          {results.starConditions && (
            <div className="w-full bg-[#f8f9ff] border border-slate-200 rounded-xl p-2.5 flex flex-col gap-1.5 text-left mb-1">
              <div className="flex items-center justify-between text-[11px] font-space">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-xs ${results.starsBreakdown?.star1 ? 'text-[#ffd700]' : 'text-slate-300'}`}>★</span>
                  <span className="font-bold text-slate-700 truncate">{results.starConditions.oneStar}</span>
                </div>
                <span className={`font-black text-[10px] px-1.5 py-0.5 rounded uppercase ${results.starsBreakdown?.star1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                  {results.starsBreakdown?.star1 ? 'CONCLUÍDO' : 'PENDENTE'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-space">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-xs ${results.starsBreakdown?.star2 ? 'text-[#ffd700]' : 'text-slate-300'}`}>★</span>
                  <span className="font-bold text-slate-700 truncate">{results.starConditions.twoStars}</span>
                </div>
                <span className={`font-black text-[10px] px-1.5 py-0.5 rounded uppercase ${results.starsBreakdown?.star2 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                  {results.starsBreakdown?.star2 ? 'CONCLUÍDO' : 'PENDENTE'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-space">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-xs ${results.starsBreakdown?.star3 ? 'text-[#ffd700]' : 'text-slate-300'}`}>★</span>
                  <span className="font-bold text-slate-700 truncate">{results.starConditions.threeStars}</span>
                </div>
                <span className={`font-black text-[10px] px-1.5 py-0.5 rounded uppercase ${results.starsBreakdown?.star3 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                  {results.starsBreakdown?.star3 ? 'DOMINADA' : 'PENDENTE'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Level Up Notification Banner */}
        {results.levelUp && (
          <div className="w-full bg-gradient-to-r from-[#fe6b00] to-[#ffd700] text-[#161c28] p-3 rounded-2xl border-2 border-[#161c28] mb-3 flex items-center justify-between hard-shadow-sm animate-pulse">
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
          {/* Primary Action Button (Next Level) */}
          {onNextLevel && (
            <button
              onClick={() => {
                soundManager.playClick();
                onNextLevel();
              }}
              className="w-full bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black py-3 rounded-2xl sticker-border hard-shadow btn-press uppercase text-sm md:text-base flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              <span>PRÓXIMA FASE</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          )}

          {!onNextLevel && !results.isTutorial && (
            <div className="w-full bg-gradient-to-r from-amber-400 to-yellow-300 text-[#161c28] font-anybody font-black py-2.5 px-3 rounded-2xl border-2 border-[#161c28] uppercase text-xs md:text-sm flex items-center justify-center gap-2">
              <span>🏆 TODAS AS FASES CONCLUÍDAS!</span>
            </div>
          )}

          {/* Repeat Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className="w-full bg-white hover:bg-slate-50 text-[#161c28] font-anybody font-black py-2.5 rounded-2xl sticker-border hard-shadow btn-press uppercase text-xs md:text-sm cursor-pointer touch-manipulation"
          >
            REPETIR FASE
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
