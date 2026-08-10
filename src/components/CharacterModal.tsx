/**
 * LOTADOR Character Customization Modal
 */

import React from 'react';
import { PlayerStats } from '../types/game';
import { savePlayerStats } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { SpriteIcon } from './SpriteIcon';

interface CharacterModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  stats,
  onUpdateStats,
  onClose,
}) => {
  const shirtColors = ['#ffd700', '#fe6b00', '#006399', '#ba1a1a', '#2e7d32'];
  const pantsColors = ['#006399', '#161c28', '#572000', '#4d4732'];

  const handleGenderSelect = (gender: 'M' | 'F') => {
    soundManager.playClick();
    const updated = { ...stats, selectedGender: gender };
    savePlayerStats(updated);
    onUpdateStats(updated);
  };

  const handleShirtSelect = (index: number) => {
    soundManager.playClick();
    const updated = { ...stats, selectedShirt: index };
    savePlayerStats(updated);
    onUpdateStats(updated);
  };

  const handlePantsSelect = (index: number) => {
    soundManager.playClick();
    const updated = { ...stats, selectedPants: index };
    savePlayerStats(updated);
    onUpdateStats(updated);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white sticker-border hard-shadow-lg p-5 md:p-6 rounded-3xl max-w-sm w-full flex flex-col items-center">
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="font-anybody font-black text-2xl text-[#161c28] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[#705d00]">checkroom</span>
            PERSONALIZAÇÃO
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

        {/* Gender Selection */}
        <div className="w-full mb-4">
          <span className="font-space font-bold text-xs text-slate-600 block mb-2 uppercase">
            Personagem:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleGenderSelect('M')}
              className={`py-2 px-3 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs flex items-center justify-center gap-2 ${
                stats.selectedGender === 'M' ? 'bg-[#ffd700] hard-shadow-sm' : 'bg-slate-100'
              }`}
            >
              <SpriteIcon name="player_male_idle_0" className="w-8 h-10" />
              <span>LOTADOR</span>
            </button>
            <button
              onClick={() => handleGenderSelect('F')}
              className={`py-2 px-3 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs flex items-center justify-center gap-2 ${
                stats.selectedGender === 'F' ? 'bg-[#ffd700] hard-shadow-sm' : 'bg-slate-100'
              }`}
            >
              <SpriteIcon name="player_female_idle_0" className="w-8 h-10" />
              <span>LOTADORA</span>
            </button>
          </div>
        </div>

        {/* Shirt Color Selection */}
        <div className="w-full mb-4">
          <span className="font-space font-bold text-xs text-slate-600 block mb-2 uppercase">
            Cor da Camisola:
          </span>
          <div className="flex gap-2 justify-between">
            {shirtColors.map((color, idx) => (
              <button
                key={color}
                onClick={() => handleShirtSelect(idx)}
                className={`w-10 h-10 rounded-full border-2 border-[#161c28] transition-transform ${
                  stats.selectedShirt === idx ? 'scale-110 ring-4 ring-[#fe6b00]' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Pants Color Selection */}
        <div className="w-full mb-6">
          <span className="font-space font-bold text-xs text-slate-600 block mb-2 uppercase">
            Cor das Calças:
          </span>
          <div className="flex gap-2 justify-between">
            {pantsColors.map((color, idx) => (
              <button
                key={color}
                onClick={() => handlePantsSelect(idx)}
                className={`w-10 h-10 rounded-full border-2 border-[#161c28] transition-transform ${
                  stats.selectedPants === idx ? 'scale-110 ring-4 ring-[#fe6b00]' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black py-3 rounded-2xl sticker-border hard-shadow btn-press uppercase"
        >
          GUARDAR VISUAL
        </button>
      </div>
    </div>
  );
};
