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
    // Launch festive confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#fe6b00', '#006399', '#ffffff'],
    });

    soundManager.playTaxiFull();
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#f9f9ff] flex flex-col items-center justify-center p-4 select-none overflow-hidden">
      {/* Container Card */}
      <div className="bg-white sticker-border hard-shadow-lg p-6 md:p-8 rounded-3xl max-w-sm w-full text-center flex flex-col items-center">
        {/* Banner Title */}
        <div className="bg-[#ffd700] sticker-border hard-shadow px-6 py-2 -rotate-2 rounded-2xl mb-4">
          <h2 className="font-anybody font-black text-2xl text-[#161c28] uppercase">
            🏁 FIM DA PARTIDA
          </h2>
        </div>

        {results.isNewRecord && (
          <div className="bg-[#fe6b00] text-white font-space font-bold text-xs uppercase px-3 py-1 rounded-full mb-4 border border-[#161c28] rush-pulse">
            🔥 NOVO RECORDE DE Kz!
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full bg-[#f1f3ff] rounded-2xl p-4 border-2 border-[#161c28] mb-6 flex flex-col gap-3">
          <div className="flex justify-between items-center font-space">
            <span className="text-slate-600 font-medium">Táxis Lotados:</span>
            <span className="font-bold text-lg text-[#161c28]">{results.taxisLoaded} 🚐</span>
          </div>

          <div className="flex justify-between items-center font-space">
            <span className="text-slate-600 font-medium">Passageiros:</span>
            <span className="font-bold text-lg text-[#161c28]">{results.passengersServed} 👤</span>
          </div>

          <div className="flex justify-between items-center font-space">
            <span className="text-slate-600 font-medium">Combo Máximo:</span>
            <span className="font-bold text-lg text-[#fe6b00]">x{results.maxCombo} 🔥</span>
          </div>

          <hr className="border-slate-300" />

          <div className="flex justify-between items-center font-space">
            <span className="text-slate-700 font-bold">Dinheiro Ganho:</span>
            <span className="font-space font-bold text-xl text-[#006399]">
              +{results.earnedMoney.toLocaleString()} Kz
            </span>
          </div>

          <div className="flex justify-between items-center font-space">
            <span className="text-slate-700 font-bold">XP Adquirido:</span>
            <span className="font-space font-bold text-base text-[#705e00]">
              +{results.earnedXp} XP
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className="w-full bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black py-3.5 rounded-2xl sticker-border hard-shadow btn-press uppercase text-lg"
          >
            JOGAR NOVAMENTE
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
