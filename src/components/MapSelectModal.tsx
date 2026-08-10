/**
 * LOTADOR Map Selection Modal
 */

import React from 'react';
import { PlayerStats } from '../types/game';
import { soundManager } from '../utils/audio';

interface MapSelectModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

export const MapSelectModal: React.FC<MapSelectModalProps> = ({ stats, onClose }) => {
  const maps = [
    {
      id: 'PARAGEM_URBANA',
      name: 'Paragem Urbana (MVP)',
      city: 'Luanda Centro',
      difficulty: 'MÉDIO',
      unlocked: true,
      desc: 'A movimentada paragem principal de táxis.',
    },
    {
      id: 'BAIRRO',
      name: 'Bairro Operário',
      city: 'Rangel',
      difficulty: 'DIFÍCIL',
      unlocked: stats.level >= 5,
      requiredLevel: 5,
      desc: 'Muita concorrência e ruas estreitas.',
    },
    {
      id: 'MERCADO',
      name: 'Mercado dos Correios',
      city: 'Kilamba Kiaxi',
      difficulty: 'MÉDIO',
      unlocked: stats.level >= 10,
      requiredLevel: 10,
      desc: 'Milhares de passageiros com compras!',
    },
    {
      id: 'SAMBA',
      name: 'Terminal da Samba',
      city: 'Samba',
      difficulty: 'EXTREMO',
      unlocked: stats.level >= 20,
      requiredLevel: 20,
      desc: 'O maior terminal para a zona sul.',
    },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white sticker-border hard-shadow-lg p-5 md:p-6 rounded-3xl max-w-md w-full flex flex-col items-center max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="font-anybody font-black text-2xl text-[#161c28] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006399]">map</span>
            ZONAS DE LUANDA
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
          {maps.map((m) => (
            <div
              key={m.id}
              className={`p-3.5 rounded-2xl border-2 border-[#161c28] flex items-center justify-between hard-shadow-sm ${
                m.unlocked ? 'bg-white' : 'bg-slate-100 opacity-70'
              }`}
            >
              <div>
                <h4 className="font-space font-bold text-base text-[#161c28] flex items-center gap-2">
                  {m.name}
                  {m.unlocked && (
                    <span className="text-[10px] bg-[#2e7d32] text-white px-2 py-0.2 rounded-full">
                      ATIVO
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 font-work">{m.desc}</p>
              </div>

              {!m.unlocked && (
                <div className="bg-slate-200 text-slate-600 px-3 py-1 rounded-xl text-xs font-space font-bold border border-slate-300">
                  🔒 LVL {m.requiredLevel}
                </div>
              )}
            </div>
          ))}
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
