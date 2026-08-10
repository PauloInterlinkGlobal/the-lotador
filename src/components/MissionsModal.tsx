/**
 * LOTADOR Missions Modal
 */

import React, { useState } from 'react';
import { PlayerStats, Mission } from '../types/game';
import { DEFAULT_MISSIONS, savePlayerStats } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface MissionsModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  stats,
  onUpdateStats,
  onClose,
}) => {
  const [missions, setMissions] = useState<Mission[]>(DEFAULT_MISSIONS);

  const handleClaim = (mission: Mission) => {
    if (mission.completed) return;
    soundManager.playCoin();

    const updatedStats: PlayerStats = {
      ...stats,
      money: stats.money + mission.rewardKz,
      xp: stats.xp + mission.rewardXp,
    };

    savePlayerStats(updatedStats);
    onUpdateStats(updatedStats);

    setMissions((prev) =>
      prev.map((m) => (m.id === mission.id ? { ...m, completed: true } : m))
    );
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white sticker-border hard-shadow-lg p-5 md:p-6 rounded-3xl max-w-md w-full flex flex-col items-center max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="font-anybody font-black text-2xl text-[#161c28] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ba1a1a]">target</span>
            MISSÕES DIÁRIAS
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

        <div className="flex flex-col gap-3 w-full mb-4">
          {missions.map((m) => {
            const isReady = stats.taxisLoaded >= m.targetCount;
            return (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl border-2 border-[#161c28] bg-white flex items-center justify-between hard-shadow-sm"
              >
                <div>
                  <h4 className="font-space font-bold text-sm text-[#161c28]">
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-work">{m.description}</p>
                  <span className="text-xs font-bold text-[#fe6b00] mt-1 block">
                    Recompensa: +{m.rewardKz} Kz | +{m.rewardXp} XP
                  </span>
                </div>

                <button
                  onClick={() => handleClaim(m)}
                  disabled={m.completed || !isReady}
                  className={`px-3 py-2 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs uppercase ${
                    m.completed
                      ? 'bg-slate-200 text-slate-500 border-slate-300'
                      : isReady
                      ? 'bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] btn-press'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {m.completed ? 'RECLAMADO' : isReady ? 'RECEBER' : 'EM CURSO'}
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
          VOLTAR
        </button>
      </div>
    </div>
  );
};
