/**
 * LOTADOR Upgrades / Oficina Modal
 */

import React from 'react';
import { PlayerStats } from '../types/game';
import { getUpgradeCost, savePlayerStats } from '../utils/storage';
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
  const upgradeItems = [
    {
      key: 'upgradeSpeed' as keyof PlayerStats,
      title: 'VELOCIDADE',
      icon: 'directions_run',
      desc: 'Aumenta a velocidade de corrida',
      level: stats.upgradeSpeed,
    },
    {
      key: 'upgradeStamina' as keyof PlayerStats,
      title: 'RESISTÊNCIA',
      icon: 'bolt',
      desc: 'Aumenta a energia máxima e recuperação',
      level: stats.upgradeStamina,
    },
    {
      key: 'upgradeVoice' as keyof PlayerStats,
      title: 'ALCANCE DA VOZ',
      icon: 'campaign',
      desc: 'Aumenta o raio de chamada de passageiros',
      level: stats.upgradeVoice,
    },
    {
      key: 'upgradePersuasion' as keyof PlayerStats,
      title: 'PERSUASÃO',
      icon: 'forum',
      desc: 'Facilita convencer passageiros indecisos',
      level: stats.upgradePersuasion,
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
      soundManager.playCall();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white sticker-border hard-shadow-lg p-5 md:p-6 rounded-3xl max-w-md w-full flex flex-col items-center max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="font-anybody font-black text-2xl text-[#161c28] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[#fe6b00]">bolt</span>
            OFICINA DE HABILIDADES
          </h2>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 border border-[#161c28] flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Currency Display */}
        <div className="w-full bg-[#f1f3ff] rounded-2xl p-3 border-2 border-[#161c28] mb-4 flex justify-between items-center">
          <span className="font-space font-bold text-sm text-slate-600">O Teu Saldo:</span>
          <span className="font-space font-bold text-lg text-[#006399]">
            {stats.money.toLocaleString()} Kz
          </span>
        </div>

        {/* Upgrades List */}
        <div className="flex flex-col gap-3 w-full mb-4">
          {upgradeItems.map((item) => {
            const cost = getUpgradeCost(item.level);
            const isMax = item.level >= 10;
            const canAfford = stats.money >= cost && !isMax;

            return (
              <div
                key={item.key}
                className="bg-white border-2 border-[#161c28] rounded-2xl p-3 flex items-center justify-between hard-shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffd700] border-2 border-[#161c28] flex items-center justify-center text-[#161c28]">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-space font-bold text-sm text-[#161c28] flex items-center gap-2">
                      {item.title}
                      <span className="text-xs bg-[#006399] text-white px-2 py-0.2 rounded-full font-bold">
                        LVL {item.level}/10
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-work">{item.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(item.key, item.level)}
                  disabled={!canAfford && !isMax}
                  className={`px-3 py-2 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs uppercase btn-press ${
                    isMax
                      ? 'bg-slate-200 text-slate-500 border-slate-300'
                      : canAfford
                      ? 'bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28]'
                      : 'bg-slate-100 text-slate-400 opacity-60'
                  }`}
                >
                  {isMax ? 'MÁX' : `${cost} Kz`}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full bg-[#161c28] text-white font-space font-bold py-3 rounded-2xl sticker-border hard-shadow uppercase text-sm"
        >
          VOLTAR AO MENU
        </button>
      </div>
    </div>
  );
};
