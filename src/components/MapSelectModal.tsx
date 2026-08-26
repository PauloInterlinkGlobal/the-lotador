/**
 * LOTADOR Campaign Map Screen Modal
 */

import React from 'react';
import { PlayerStats } from '../types/game';
import { CAMPAIGN_ZONES, savePlayerStats } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface MapSelectModalProps {
  stats: PlayerStats;
  onUpdateStats?: (newStats: PlayerStats) => void;
  onClose: () => void;
}

export const MapSelectModal: React.FC<MapSelectModalProps> = ({
  stats,
  onUpdateStats,
  onClose,
}) => {
  const handleSelectZone = (zoneId: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      soundManager.playHorn();
      return;
    }
    soundManager.playCoin();
    const updated = { ...stats, selectedMapId: zoneId };
    savePlayerStats(updated);
    if (onUpdateStats) onUpdateStats(updated);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white sticker-border hard-shadow-lg p-5 md:p-6 rounded-3xl max-w-lg w-full flex flex-col items-center max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center w-full mb-3">
          <div>
            <h2 className="font-anybody font-black text-2xl text-[#161c28] uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006399]">map</span>
              MAPA DE CAMPANHA
            </h2>
            <p className="text-xs text-slate-500 font-work">
              Desbloqueia zonas e aumenta os teus ganhos em Luanda!
            </p>
          </div>
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

        {/* Zones List */}
        <div className="flex flex-col gap-3.5 w-full mb-4">
          {CAMPAIGN_ZONES.map((zone) => {
            const isUnlocked =
              stats.unlockedMaps.includes(zone.id) ||
              stats.level >= zone.requiredLevel;
            const isSelected = stats.selectedMapId === zone.id;

            return (
              <div
                key={zone.id}
                onClick={() => handleSelectZone(zone.id, isUnlocked)}
                className={`p-4 rounded-2xl border-2 border-[#161c28] flex flex-col gap-2 relative transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#fffbeb] border-4 border-[#fe6b00] hard-shadow-md'
                    : isUnlocked
                    ? 'bg-white hover:bg-slate-50 hard-shadow-sm'
                    : 'bg-slate-100 opacity-70 border-dashed'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-anybody font-black text-lg text-[#161c28]">
                        {zone.name}
                      </span>
                      {isSelected && (
                        <span className="bg-[#fe6b00] text-white text-[10px] font-space font-bold px-2.5 py-0.5 rounded-full uppercase border border-[#161c28]">
                          ZONA ATIVA
                        </span>
                      )}
                      {!isSelected && isUnlocked && (
                        <span className="bg-[#2e7d32] text-white text-[10px] font-space font-bold px-2 py-0.5 rounded-full uppercase">
                          DESBLOQUEADA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-work font-medium">
                      📍 {zone.city} • Dificuldade: {zone.difficulty}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="bg-[#ffd700] text-[#705e00] font-space font-black text-xs px-2.5 py-1 rounded-xl border border-[#161c28]">
                      +{Math.round((zone.bonusKzMultiplier - 1) * 100)}% KZ
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-work italic">{zone.desc}</p>

                {!isUnlocked && (
                  <div className="mt-1 pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-space font-bold text-slate-600">
                    <span>🔒 REQUISITOS DE DESBLOQUEIO:</span>
                    <span className="bg-slate-200 px-2.5 py-0.5 rounded-lg border border-slate-300">
                      NÍVEL {zone.requiredLevel}
                    </span>
                  </div>
                )}
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
          CONFIRMAR ZONA DE JOGO
        </button>
      </div>
    </div>
  );
};

