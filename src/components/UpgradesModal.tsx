/**
 * LOTADOR Upgrades / Oficina de Habilidades
 * Displays player rank/tier, level XP progress, and stat attribute upgrades
 * (Speed, Stamina, Voice Range, Persuasion) with visual progress meters.
 */

import React from 'react';
import { PlayerStats } from '../types/game';
import { getUpgradeCost, savePlayerStats, getPlayerTier, getLevelTitle, getXpForNextLevel } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface UpgradesModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  stats,
  onUpdateStats,
  onClose,
}) => {
  const tier = getPlayerTier(stats.level);
  const title = getLevelTitle(stats.level);
  const nextXp = getXpForNextLevel(stats.level);
  const xpPercent = Math.min(100, Math.round((stats.xp / nextXp) * 100));

  const upgradeItems = [
    {
      key: 'upgradeSpeed' as keyof PlayerStats,
      title: 'VELOCIDADE',
      icon: 'directions_run',
      desc: 'Corre mais rápido pelos passeios e corta caminho',
      level: stats.upgradeSpeed,
      benefit: `+${(stats.upgradeSpeed * 6).toFixed(0)}% vel. corrida`,
    },
    {
      key: 'upgradeStamina' as keyof PlayerStats,
      title: 'ENERGIA & RECUPERAÇÃO',
      icon: 'bolt',
      desc: 'Mais fôlego para correr e recarrega mais rápido',
      level: stats.upgradeStamina,
      benefit: `+${stats.upgradeStamina * 12} energia máx.`,
    },
    {
      key: 'upgradeVoice' as keyof PlayerStats,
      title: 'ALCANCE DA VOZ',
      icon: 'campaign',
      desc: 'Raio sonoro de chamada de passageiros mais amplo',
      level: stats.upgradeVoice,
      benefit: `+${(stats.upgradeVoice * 0.45).toFixed(1)}m de raio`,
    },
    {
      key: 'upgradePersuasion' as keyof PlayerStats,
      title: 'PERSUASÃO & DISPUTA',
      icon: 'forum',
      desc: 'Vence disputas "É MEU!" contra rivais com mais facilidade',
      level: stats.upgradePersuasion,
      benefit: `+${(stats.upgradePersuasion * 4.5).toFixed(0)}% força no grito`,
    },
  ];

  const handleBuy = (key: keyof PlayerStats, currentLevel: number) => {
    if (currentLevel >= 10) return;
    const cost = getUpgradeCost(currentLevel);
    if (stats.money >= cost) {
      soundManager.playCoin();
      const updated: PlayerStats = {
        ...stats,
        money: stats.money - cost,
        [key]: currentLevel + 1,
      };
      savePlayerStats(updated);
      onUpdateStats(updated);
    } else {
      soundManager.playHorn();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#241a15]/80 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 select-none font-work">
      <div className="bg-white sticker-border hard-shadow-lg p-4 md:p-6 rounded-3xl max-w-lg w-full flex flex-col items-center max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#ffd700] border-2 border-[#161c28] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#161c28] text-xl">build</span>
            </div>
            <div>
              <h2 className="font-anybody font-black text-xl text-[#161c28] uppercase">
                OFICINA DO NELO
              </h2>
              <p className="text-[11px] text-slate-500 font-space">
                Evolução de Atributos & Reputação
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-[#161c28] flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Player Progression Summary Card */}
        <div className="w-full bg-gradient-to-r from-[#161c28] to-[#242b3b] text-white rounded-2xl p-3.5 border-2 border-[#161c28] mb-3.5 hard-shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-space font-bold px-2.5 py-0.5 rounded-lg bg-[#ffd700] text-[#161c28]">
                {tier.badge}
              </span>
              <span className="font-anybody text-sm font-black text-slate-200">
                {title}
              </span>
            </div>
            <span className="font-space font-bold text-xs text-[#00b4d8]">
              NÍVEL {stats.level}
            </span>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-space text-slate-300 mb-1">
              <span>Experiência (XP):</span>
              <span className="font-bold text-[#ffd700]">
                {stats.xp} / {nextXp} XP ({xpPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full border border-slate-600 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#fe6b00] to-[#ffd700] transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-700 text-xs font-space">
            <span className="text-slate-400">Saldo Disponível:</span>
            <span className="font-bold text-base text-[#ffd700]">
              💰 {stats.money.toLocaleString()} Kz
            </span>
          </div>
        </div>

        {/* Upgrades List */}
        <div className="flex flex-col gap-2.5 w-full mb-4">
          {upgradeItems.map((item) => {
            const cost = getUpgradeCost(item.level);
            const isMax = item.level >= 10;
            const canAfford = stats.money >= cost && !isMax;

            return (
              <div
                key={item.key}
                className="bg-white border-2 border-[#161c28] rounded-2xl p-3 flex items-center justify-between hard-shadow-sm hover:border-black transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 mr-2">
                  <div className="w-10 h-10 rounded-xl bg-[#ffd700] border-2 border-[#161c28] flex items-center justify-center text-[#161c28] shrink-0">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-space font-bold text-xs md:text-sm text-[#161c28] truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] bg-[#006399] text-white px-1.5 py-0.2 rounded-md font-space font-bold shrink-0">
                        NV {item.level}/10
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-work leading-tight truncate">
                      {item.desc}
                    </p>
                    
                    {/* Visual Segment Bars */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-sm ${
                            i < item.level
                              ? 'bg-[#fe6b00]'
                              : 'bg-slate-200 border border-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(item.key, item.level)}
                  disabled={!canAfford && !isMax}
                  className={`px-3 py-2 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs uppercase btn-press shrink-0 text-center min-w-[85px] ${
                    isMax
                      ? 'bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed'
                      : canAfford
                      ? 'bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28]'
                      : 'bg-slate-100 text-slate-400 opacity-70 cursor-not-allowed'
                  }`}
                >
                  {isMax ? (
                    'MÁXIMO'
                  ) : (
                    <>
                      <div className="text-[10px] text-slate-600 font-medium">MELHORAR</div>
                      <div>{cost} Kz</div>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Close */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full bg-[#161c28] hover:bg-slate-800 text-white font-space font-bold py-3 rounded-2xl sticker-border hard-shadow uppercase text-sm btn-press"
        >
          VOLTAR À PARAGEM
        </button>
      </div>
    </div>
  );
};
