/**
 * LOTADOR — Tela de Resultados / Vitória (VictoryScreen)
 * Apresentação comemorativa quando a partida termina com sucesso.
 * Se todos os objetivos foram cumpridos, celebra com subida de nível,
 * confetti CSS animado, fanfarra WebAudio e bloco de recompensas especiais.
 */

import React, { useEffect, useMemo } from 'react';
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
  const isLevelUp = Boolean(results.levelUp && !results.isTutorial);
  const allMissionsDone = Boolean(results.allMissionsDone ?? isLevelUp);

  const newLevel = results.newLevel || (results.oldLevel ? results.oldLevel + 1 : 2);
  const displayTitle = results.newTitle || getLevelTitle(newLevel);
  const playerTier = getPlayerTier(newLevel);

  const bonusKz = results.levelUpRewardKz ?? (250 * newLevel);
  const bonusXp = results.levelUpRewardXp ?? (150 * newLevel);
  const skillPoints = results.skillPointsEarned ?? 1;

  // Peças de confetti animadas puramente em CSS para visual rico e independente de bibliotecas
  const cssConfettiPieces = useMemo(() => {
    const colors = ['#ffd700', '#fe6b00', '#006399', '#2e7d32', '#ba1a1a', '#e91e63'];
    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      left: `${(i * 2.8 + (i % 5) * 2.1) % 96}%`,
      color: colors[i % colors.length],
      size: `${6 + (i % 4) * 3}px`,
      delay: `${(i * 0.08) % 1.6}s`,
      duration: `${2.4 + (i % 5) * 0.4}s`,
      rotation: `${(i * 37) % 360}deg`,
    }));
  }, []);

  useEffect(() => {
    // Confetti comemorativo (Canvas Confetti se disponível)
    try {
      confetti({
        particleCount: isParagemDominada || isLevelUp ? 120 : 70,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#fe6b00', '#006399', '#ffffff', '#2e7d32'],
      });
    } catch (e) {
      // Fallback gracioso para os confetes CSS
    }

    if (isLevelUp) {
      soundManager.playLevelUpFanfare();
      soundManager.playLevelUp();
    } else {
      soundManager.playTaxiFull();
    }
  }, [isParagemDominada, isLevelUp]);

  return (
    <div className="relative w-full h-screen bg-[#241a15]/90 backdrop-blur-xs flex flex-col items-center justify-center p-3 md:p-4 select-none overflow-hidden font-work z-50">
      
      {/* Chuva de Confetti CSS animado sobre o painel */}
      {isLevelUp && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-55">
          {cssConfettiPieces.map((p) => (
            <div
              key={p.id}
              className="confetti-piece"
              style={{
                left: p.left,
                width: p.size,
                height: `${parseInt(p.size, 10) * 1.5}px`,
                backgroundColor: p.color,
                animationDelay: p.delay,
                animationDuration: p.duration,
                transform: `rotate(${p.rotation})`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className={`bg-white sticker-border hard-shadow-lg p-5 md:p-6 rounded-3xl max-w-md w-full text-center flex flex-col items-center max-h-[95vh] overflow-y-auto relative z-60 ${
          isLevelUp ? 'level-up-entrance level-up-glow' : 'animate-in zoom-in-95 duration-200'
        }`}
      >
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

        {/* Banner comemorativo principal */}
        {allMissionsDone && !results.isTutorial ? (
          <div className="w-full bg-[#2e7d32] text-white sticker-border hard-shadow px-5 py-2.5 rounded-2xl mb-3 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#ffd700]">check_circle</span>
            <h2 className="font-anybody font-black text-lg md:text-xl uppercase tracking-wider">
              OBJETIVOS CUMPRIDOS!
            </h2>
          </div>
        ) : (
          <div
            className={`sticker-border hard-shadow px-6 py-2 rounded-2xl mb-3 w-full ${
              isParagemDominada ? 'bg-[#ffd700] text-[#161c28]' : 'bg-[#fe6b00] text-white'
            }`}
          >
            <h2 className="font-anybody font-black text-lg md:text-xl uppercase tracking-wider flex items-center justify-center gap-2">
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
        )}

        {/* Bloco de Destaque: SUBISTE PARA O NÍVEL X! */}
        {isLevelUp && (
          <div className="w-full bg-gradient-to-r from-[#ffd700] via-[#fe6b00] to-[#ffd700] p-1 rounded-3xl border-3 border-[#161c28] hard-shadow mb-3.5">
            <div className="bg-[#161c28] text-white p-3.5 rounded-[22px] flex flex-col items-center">
              <span className="text-[10px] font-space font-black uppercase tracking-widest text-[#ffd700] bg-[#241a15] px-3 py-1 rounded-full border border-[#ffd700]/40 mb-1.5 flex items-center gap-1">
                <span>⭐ NOVO PATAMAR ALCANÇADO ⭐</span>
              </span>

              <h3 className="font-anybody font-black text-2xl md:text-3xl text-[#ffd700] tracking-wide my-1">
                SUBISTE PARA O NÍVEL {newLevel}!
              </h3>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs md:text-sm font-space font-bold text-white">
                  Título: <span className="text-[#ffd700] font-black">{displayTitle}</span>
                </span>
                {playerTier && (
                  <span className="text-[10px] bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/40 px-2 py-0.5 rounded-full font-space font-black">
                    {playerTier.badge}
                  </span>
                )}
              </div>

              {/* Bloco de Recompensas de Subida de Nível */}
              <div className="w-full mt-3 pt-3 border-t border-white/15 grid grid-cols-3 gap-2">
                <div className="bg-white/10 rounded-xl p-2 flex flex-col items-center">
                  <span className="text-[10px] font-space font-semibold text-slate-300">BÓNUS KZ</span>
                  <span className="font-space font-black text-xs md:text-sm text-[#ffd700]">
                    +{bonusKz.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/10 rounded-xl p-2 flex flex-col items-center">
                  <span className="text-[10px] font-space font-semibold text-slate-300">XP EXTRA</span>
                  <span className="font-space font-black text-xs md:text-sm text-[#70d6ff]">
                    +{bonusXp} XP
                  </span>
                </div>
                <div className="bg-white/10 rounded-xl p-2 flex flex-col items-center">
                  <span className="text-[10px] font-space font-semibold text-slate-300">HABILIDADE</span>
                  <span className="font-space font-black text-xs md:text-sm text-[#a3e635]">
                    +{skillPoints} PT
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Star Rating Section */}
        <div className="flex flex-col items-center mb-3 w-full">
          <div className="flex items-center justify-center gap-2 mb-1">
            {[1, 2, 3].map((starNum) => {
              const earned = starNum <= stars;
              return (
                <div
                  key={starNum}
                  className={`w-11 h-11 md:w-13 md:h-13 rounded-2xl border-2 border-[#161c28] flex items-center justify-center text-xl md:text-2xl transition-transform ${
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

          <span className="font-space text-xs font-bold text-slate-600 mb-2">
            {stars === 3
              ? '⭐ Perfeito! 3 Estrelas conquistadas'
              : stars === 2
              ? '⭐ Muito bom! 2 Estrelas conquistadas'
              : '⭐ Fase superada! 1 Estrela conquistada'}
          </span>

          {/* Checklist de Objetivos da Ronda */}
          {results.objectivesSummary && results.objectivesSummary.length > 0 && (
            <div className="w-full bg-[#f8f9ff] border-2 border-slate-200 rounded-2xl p-3 flex flex-col gap-2 text-left mb-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-space text-[11px] font-black uppercase text-slate-600 tracking-wider">
                  Objetivos da Ronda
                </span>
                <span className="font-space text-[10px] font-bold text-slate-500">
                  {results.missionsDone ?? results.objectivesSummary.filter((o) => o.completed).length} / {results.missionsTotal ?? results.objectivesSummary.length} Cumpridos
                </span>
              </div>

              {results.objectivesSummary.map((obj, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-space gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-sm ${obj.completed ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {obj.completed ? '✓' : '○'}
                    </span>
                    <span className={`truncate ${obj.completed ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                      {obj.description}
                    </span>
                  </div>
                  <span
                    className={`font-black text-[10px] px-2 py-0.5 rounded-full shrink-0 uppercase border ${
                      obj.completed
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border-slate-300'
                    }`}
                  >
                    {obj.completed ? 'CONCLUÍDO' : 'PENDENTE'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Nota discreta quando falta algum objetivo */}
          {!allMissionsDone && !results.isTutorial && (
            <div className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 mb-2 text-left flex items-center gap-2">
              <span className="text-base text-amber-600">💡</span>
              <p className="font-space text-[11px] font-bold text-amber-900 leading-snug">
                Cumpre todos os objetivos para subir de nível.
              </p>
            </div>
          )}
        </div>

        {/* Estatísticas da Partida */}
        <div className="w-full bg-[#f1f3ff] rounded-2xl p-3.5 border-2 border-[#161c28] mb-3.5 flex flex-col gap-2">
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

          {/* Ganhos em Kz e XP */}
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

        {/* Botões de Ação */}
        <div className="flex flex-col gap-2 w-full">
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
