/**
 * LOTADOR Match Result Screen
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MatchResults } from '../types/game';
import { soundManager } from '../utils/audio';

interface ResultScreenProps {
  results: MatchResults;
  onPlayAgain: () => void;
  onContinue: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  results,
  onPlayAgain,
  onContinue,
}) => {
  useEffect(() => {
    if (results.isVictory !== false) {
      // Launch festive confetti for victory or normal end
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#fe6b00', '#006399', '#ffffff'],
      });
      soundManager.playTaxiFull();
    }
  }, [results.isVictory]);

  const isTutorialDefeat = results.isTutorial && results.isVictory === false;

  return (
    <div className="relative w-full h-screen bg-[#f9f9ff] flex flex-col items-center justify-center p-4 select-none overflow-hidden">
      {/* Container Card */}
      <div className="bg-white sticker-border hard-shadow-lg p-6 md:p-8 rounded-3xl max-w-sm w-full text-center flex flex-col items-center">
        {/* Banner Title */}
        <div
          className={`sticker-border hard-shadow px-6 py-2 -rotate-2 rounded-2xl mb-4 ${
            isTutorialDefeat ? 'bg-[#ba1a1a] text-white' : 'bg-[#ffd700] text-[#161c28]'
          }`}
        >
          <h2 className="font-anybody font-black text-2xl uppercase">
            {results.isTutorial
              ? results.isVictory
                ? '🏆 TUTORIAL CONCLUÍDO!'
                : '⏱️ TEMPO ESGOTADO'
              : '🏁 FIM DA PARTIDA'}
          </h2>
        </div>

        {results.isTutorial && (
          <p className="font-work text-xs md:text-sm text-slate-600 mb-4 px-2 leading-relaxed">
            {results.isVictory
              ? 'Parabéns! Aprendeste a movimentar-te, chamar passageiros, conduzi-los aos táxis e gerir a tua energia na paragem.'
              : 'Não conseguiste completar os objetivos antes do tempo esgotar. Lembra-te de correr [Shift] e levar os passageiros rápido!'}
          </p>
        )}

        {results.isNewRecord && !results.isTutorial && (
          <div className="bg-[#fe6b00] text-white font-space font-bold text-xs uppercase px-3 py-1 rounded-full mb-4 border border-[#161c28] rush-pulse">
            🔥 NOVO RECORDE DE Kz!
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full bg-[#f1f3ff] rounded-2xl p-4 border-2 border-[#161c28] mb-4 flex flex-col gap-2.5">
          <div className="flex justify-between items-center font-space text-sm">
            <span className="text-slate-600 font-medium">Táxis Lotados:</span>
            <span className="font-bold text-base text-[#161c28]">{results.taxisLoaded} 🚐</span>
          </div>

          <div className="flex justify-between items-center font-space text-sm">
            <span className="text-slate-600 font-medium">Passageiros:</span>
            <span className="font-bold text-base text-[#161c28]">{results.passengersServed} 👤</span>
          </div>

          <div className="flex justify-between items-center font-space text-sm">
            <span className="text-slate-600 font-medium">Combo Máximo:</span>
            <span className="font-bold text-base text-[#fe6b00]">x{results.maxCombo} 🔥</span>
          </div>

          <hr className="border-slate-300" />

          <div className="flex justify-between items-center font-space text-sm">
            <span className="text-slate-700 font-bold">Dinheiro Ganho:</span>
            <span className="font-space font-bold text-lg text-[#006399]">
              +{results.earnedMoney.toLocaleString()} Kz
            </span>
          </div>

          <div className="flex justify-between items-center font-space text-sm">
            <span className="text-slate-700 font-bold">XP Adquirido:</span>
            <span className="font-space font-bold text-sm text-[#705e00]">
              +{results.earnedXp} XP
            </span>
          </div>
        </div>

        {/* Mission Rewards Banner */}
        {results.taxisLoaded >= 3 && (
          <div className="w-full bg-[#2e7d32] text-white p-2.5 rounded-2xl border-2 border-[#161c28] mb-4 flex items-center justify-between text-xs font-space font-bold hard-shadow-sm">
            <span className="flex items-center gap-1">
              🎯 MISSÃO CONCLUÍDA!
            </span>
            <span className="bg-[#ffd700] text-[#705e00] px-2 py-0.5 rounded-lg border border-[#161c28]">
              +500 Kz RECOMPENSA
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className="w-full bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black py-3.5 rounded-2xl sticker-border hard-shadow btn-press uppercase text-base"
          >
            {results.isTutorial
              ? results.isVictory
                ? 'CONTINUAR (NÍVEL 2)'
                : 'TENTAR TUTORIAL NOVAMENTE'
              : 'JOGAR NOVAMENTE'}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onContinue();
            }}
            className="w-full bg-white hover:bg-slate-50 text-[#161c28] font-space font-bold py-3.5 rounded-2xl sticker-border hard-shadow btn-press uppercase text-sm"
          >
            MENU PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
};
